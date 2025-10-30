import { clerkClient, clerkMiddleware, getAuth } from '@clerk/express';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { User } from './models/User.js';
import { tapGame } from './routes/tapGame.js';

const app = express();
app.use(cors());

// Register Clerk middleware BEFORE any routes that use getAuth
app.use(clerkMiddleware());

// ---- serve /static so the app can load uploaded images
app.use('/static', express.static(path.join(process.cwd(), 'static')));

// ---- ensure upload dir exists
const uploadDir = path.join(process.cwd(), 'static', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// ---- configure multer (save to /static/uploads)
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    console.log('Multer destination:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    console.log('Multer filename:', name);
    cb(null, name);
  },
});
const fileFilter = (_, file, cb) => {
  console.log('Multer file filter - mimetype:', file.mimetype);
  const ok = /^image\/(png|jpe?g|gif|webp)$/.test(file.mimetype);
  console.log('Multer file filter - allowed:', ok);
  cb(ok ? null : new Error('Only image files allowed'), ok);
};
const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB
});

// ---- upload route (auth required) - MUST be before express.json()
app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  console.log('Upload endpoint hit');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  console.log('User ID:', req.userId);
  
  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // public URL for the image
  const url = `${req.protocol}://${req.get('host')}/static/uploads/${req.file.filename}`;
  console.log('Generated URL:', url);
  res.json({ ok: true, url });
});

// JSON middleware - MUST be after multer routes
app.use(express.json());


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/child_wellness';

async function getUserInfoFromClerk(clerkId) {
  try {
    // Handle test user for development
    if (clerkId === 'test_user_123') {
      return { name: 'Test User', email: 'test@example.com' };
    }
    
    const user = await clerkClient.users.getUser(clerkId);
    return {
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddresses[0]?.emailAddress || 'User',
      email: user.emailAddresses[0]?.emailAddress || ''
    };
  } catch (error) {
    console.log('Could not fetch user info from Clerk:', error.message);
    return { name: 'User', email: '' };
  }
}

async function ensureUser(clerkId) {
  // Get user info from Clerk
  const { name, email } = await getUserInfoFromClerk(clerkId);
  
  // Use upsert to create or update user
  const user = await User.findOneAndUpdate(
    { clerkId },
    {
      $setOnInsert: {
        clerkId,
        name,
        email,
        rewards: {
          xp: 0,
          coins: 0,
          hearts: 5,
          streakDays: 0,
          lastPlayedDate: null,
          totalGamesPlayed: 0
        }
      }
    },
    { 
      upsert: true, 
      new: true,
      setDefaultsOnInsert: true
    }
  );
  
  if (user.isNew) {
    console.log(`Created new user: ${clerkId} with name: ${name}`);
  } else {
    console.log(`Found existing user: ${clerkId} with name: ${name}`);
  }
  
  return user;
}

function requireAuth(req, res, next) {
  const { userId } = getAuth(req);
  console.log('🔍 Auth Debug:', {
    hasUserId: !!userId,
    userId: userId,
    authHeader: req.headers.authorization,
    userAgent: req.headers['user-agent']
  });
  
  if (!userId) {
    console.log('No userId found in request, using test user for development');
    // For development/testing purposes, use a test user ID
    req.userId = 'test_user_123';
    return next();
  }
  req.userId = userId;
  next();
}

// Add tap game routes
app.use('/api/tap', requireAuth, tapGame);
// app.use('/api/content', content);
// app.use('/api/utterances', utterances);

// Test endpoint for network connectivity
app.get('/api/test', (req, res) => {
  console.log('🔍 Test endpoint hit from:', req.headers['user-agent']);
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create or fetch the authenticated user immediately after verification/login
app.post('/api/users/ensure', requireAuth, async (req, res) => {
  try {
    const user = await ensureUser(req.userId);
    res.json({
      ok: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dob: user.dob,
        rewards: user.rewards,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Failed to ensure user:', error);
    res.status(500).json({ ok: false, error: 'Failed to ensure user' });
  }
});

// Get current user's profile
app.get('/api/me/profile', requireAuth, async (req, res) => {
  try {
    const user = await ensureUser(req.userId);
    res.json({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      dob: user.dob || null,
      gender: user.gender || null,
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// Update current user's profile (DOB immutable once set)
app.post('/api/me/profile', requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, dob, gender } = req.body || {};
    const user = await ensureUser(req.userId);
    if (typeof firstName === 'string') user.firstName = firstName.trim();
    if (typeof lastName === 'string') user.lastName = lastName.trim();
    // Allow setting dob only if not already set
    if (!user.dob && dob) {
      const parsed = new Date(dob);
      if (!isNaN(parsed.getTime())) user.dob = parsed;
    }
    // Allow setting gender only if not already set
    if (!user.gender && gender && ['male', 'female', 'other', 'prefer-not-to-say'].includes(gender)) {
      user.gender = gender;
    }
    // Maintain name field as display name
    user.name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name;
    await user.save();
    res.json({ ok: true });
  } catch (e) {
    console.error('Update profile failed:', e);
    res.status(500).json({ ok: false, error: 'Failed to update profile' });
  }
});

app.get('/api/me/stats', requireAuth, async (req, res) => {
  const user = await ensureUser(req.userId);
  res.json({
    xp: user.rewards?.xp ?? 0,
    coins: user.rewards?.coins ?? 0,
    hearts: user.rewards?.hearts ?? 5,
    streakDays: user.rewards?.streakDays ?? 0,
    lastPlayedDate: user.rewards?.lastPlayedDate ?? null,
  });
});

app.post('/api/games/record', requireAuth, async (req, res) => {
  const { pointsEarned = 10, coins = 0, xp = 10 } = req.body || {};
  const today = new Date();
  const todayYmd = today.toISOString().slice(0, 10);

  const user = await ensureUser(req.userId);
  const rewards = user.rewards || {};

  if (rewards.lastPlayedDate) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yYmd = yesterday.toISOString().slice(0, 10);
    if (rewards.lastPlayedDate === todayYmd) {
      // same day, keep streak
    } else if (rewards.lastPlayedDate === yYmd) {
      rewards.streakDays = (rewards.streakDays || 0) + 1;
    } else {
      rewards.streakDays = 1;
    }
  } else {
    rewards.streakDays = 1;
  }

  rewards.lastPlayedDate = todayYmd;
  rewards.xp = (rewards.xp || 0) + Number(xp || pointsEarned || 0);
  rewards.coins = (rewards.coins || 0) + Number(coins || 0);
  rewards.hearts = Math.max(0, Math.min(5, rewards.hearts ?? 5));
  user.rewards = rewards;
  await user.save();
  res.json({
    xp: rewards.xp,
    coins: rewards.coins,
    hearts: rewards.hearts,
    streakDays: rewards.streakDays,
    lastPlayedDate: rewards.lastPlayedDate,
  });
});

// Favorites
app.get('/api/me/favorites', requireAuth, async (req, res) => {
  const user = await ensureUser(req.userId);
  res.json({ favorites: user.favorites || [] });
});

app.post('/api/me/favorites/toggle', requireAuth, async (req, res) => {
  const { tileId } = req.body || {};
  if (!tileId) return res.status(400).json({ error: 'tileId required' });
  const user = await ensureUser(req.userId);
  const set = new Set(user.favorites || []);
  let isFavorite;
  if (set.has(tileId)) {
    set.delete(tileId);
    isFavorite = false;
  } else {
    set.add(tileId);
    isFavorite = true;
  }
  user.favorites = Array.from(set);
  await user.save();
  res.json({ ok: true, isFavorite, favorites: user.favorites });
});

// Custom tiles
app.get('/api/me/custom-tiles', requireAuth, async (req, res) => {
  const user = await ensureUser(req.userId);
  res.json({ tiles: user.customTiles || [] });
});

app.post('/api/me/custom-tiles', requireAuth, async (req, res) => {
  const { id, label, emoji, imageUrl } = req.body || {};
  if (!id || !label) return res.status(400).json({ error: 'id and label required' });
  const user = await ensureUser(req.userId);
  // prevent duplicates by id
  const exists = (user.customTiles || []).some(t => t.id === id);
  if (exists) return res.status(409).json({ error: 'id already exists' });
  user.customTiles.push({ id, label, emoji, imageUrl });
  await user.save();
  res.json({ ok: true, tile: { id, label, emoji, imageUrl } });
});

app.put('/api/me/custom-tiles/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { label, emoji, imageUrl } = req.body || {};
  if (!label) return res.status(400).json({ error: 'label required' });
  const user = await ensureUser(req.userId);
  const tileIndex = (user.customTiles || []).findIndex(t => t.id === id);
  if (tileIndex === -1) return res.status(404).json({ error: 'tile not found' });
  
  // Update the tile
  user.customTiles[tileIndex] = { 
    ...user.customTiles[tileIndex], 
    label, 
    emoji, 
    imageUrl 
  };
  await user.save();
  res.json({ ok: true, tile: user.customTiles[tileIndex] });
});

app.delete('/api/me/custom-tiles/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const user = await ensureUser(req.userId);
  user.customTiles = (user.customTiles || []).filter(t => t.id !== id);
  await user.save();
  res.json({ ok: true });
});

const port = process.env.PORT || 4000;

async function startServer() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    app.listen(port, '0.0.0.0', () => console.log(`API listening on 0.0.0.0:${port}`));
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

startServer();