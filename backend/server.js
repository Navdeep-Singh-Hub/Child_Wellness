import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { Session } from './models/Session.js';
import { User } from './models/User.js';
import { tapGame } from './routes/tapGame.js';

const app = express();
app.use(cors());

// TODO: Auth0 JWT middleware goes here
// app.use(auth0JWTMiddleware());

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

async function ensureUser(auth0Id, email, name) {
  // Use upsert to create or update user with Auth0 info
  const user = await User.findOneAndUpdate(
    { auth0Id },
    {
      $setOnInsert: {
        auth0Id,
        email: email || '',
        name: name || email || 'User',
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
    console.log(`Created new user: ${auth0Id} with email: ${email}`);
  } else {
    console.log(`Found existing user: ${auth0Id} with email: ${email}`);
  }
  
  return user;
}

// Replace requireAuth to extract Auth0 user info from request body or JWT
function requireAuth(req, res, next) {
  // For now, get auth0Id from request body or headers (we'll send it from frontend)
  // TODO: In production, parse Auth0 JWT from Authorization header
  const auth0Id = req.body?.auth0Id || req.headers['x-auth0-id'] || 'auth0_test_user';
  const email = req.body?.email || req.headers['x-auth0-email'] || '';
  const name = req.body?.name || req.headers['x-auth0-name'] || '';
  
  req.auth0Id = auth0Id;
  req.auth0Email = email;
  req.auth0Name = name;
  req.userId = auth0Id; // Keep for backward compatibility
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
    const auth0Id = req.body?.auth0Id || req.auth0Id;
    const email = req.body?.email || req.auth0Email;
    const name = req.body?.name || req.auth0Name;
    
    if (!auth0Id) {
      console.error('ensure-user: missing auth0Id', {
        headers: {
          xAuth0Id: req.headers['x-auth0-id'],
          auth: req.headers.authorization,
        },
        body: req.body,
      });
      return res.status(401).json({ ok: false, error: 'Missing auth0Id' });
    }
    
    const user = await ensureUser(auth0Id, email, name);
    res.json({
      ok: true,
      user: {
        id: user._id,
        auth0Id: user.auth0Id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dob: user.dob,
        gender: user.gender,
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
    const auth0Id = req.auth0Id;
    const email = req.auth0Email || '';
    const name = req.auth0Name || '';
    if (!auth0Id) {
      console.error('get-profile: missing auth0Id');
      return res.status(401).json({ error: 'Missing auth0Id' });
    }
    const user = await ensureUser(auth0Id, email, name);
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
    const auth0Id = req.auth0Id;
    const email = req.auth0Email || '';
    const name = req.auth0Name || '';
    if (!auth0Id) {
      console.error('update-profile: missing auth0Id. Headers:', {
        xAuth0Id: req.headers['x-auth0-id'],
        authHeader: req.headers.authorization,
      });
      return res.status(401).json({ ok: false, error: 'Missing auth0Id' });
    }
    const { firstName, lastName, dob, gender } = req.body || {};
    const user = await ensureUser(auth0Id, email, name);
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
    console.error('Update profile failed:', e?.message || e, {
      stack: e?.stack,
    });
    res.status(500).json({ ok: false, error: 'Failed to update profile' });
  }
});



// POST /api/me/game-log
app.post('/api/me/game-log', requireAuth, async (req, res) => {
  try {
    const userId = req.userId || req.auth0Id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { type, correct, total, accuracy, xpAwarded, durationMs } = req.body || {};
    if (!type || typeof correct !== 'number' || typeof total !== 'number') {
      return res.status(400).json({ error: 'Missing fields' });
    }

    let session = await Session.findOne({ userId });
    if (!session) session = await Session.create({ userId });

    session.gameLogs.push({
      userId,
      type,
      correct,
      total,
      accuracy: Math.max(0, Math.min(100, Math.round(accuracy))),
      xpAwarded: xpAwarded || 0,
      durationMs: durationMs || 0,
      at: new Date(),
    });

    session.points = (session.points || 0) + (xpAwarded || 0);
    session.totalGamesPlayed = (session.totalGamesPlayed || 0) + 1;

    await session.save();
    res.json({ ok: true, points: session.points, totalGamesPlayed: session.totalGamesPlayed, last: session.gameLogs.at(-1) });
  } catch (e) {
    console.error('game-log error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/me/stats', requireAuth, async (req, res) => {
  const auth0Id = req.auth0Id;
  const email = req.auth0Email || '';
  const name = req.auth0Name || '';
  const user = await ensureUser(auth0Id, email, name);
  res.json({
    xp: user.rewards?.xp ?? 0,
    coins: user.rewards?.coins ?? 0,
    hearts: user.rewards?.hearts ?? 5,
    streakDays: user.rewards?.streakDays ?? 0,
    bestStreak: user.rewards?.bestStreak ?? 0,
    lastPlayedDate: user.rewards?.lastPlayedDate ?? null,
  });
});

app.post('/api/games/record', requireAuth, async (req, res) => {
  const { pointsEarned = 10, coins = 0, xp = 10 } = req.body || {};
  const today = new Date();
  const todayYmd = today.toISOString().slice(0, 10);

  const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
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
  // Track best streak
  const currentStreak = rewards.streakDays || 0;
  const best = rewards.bestStreak || 0;
  if (currentStreak > best) {
    rewards.bestStreak = currentStreak;
  }
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
  const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
  res.json({ favorites: user.favorites || [] });
});

app.post('/api/me/favorites/toggle', requireAuth, async (req, res) => {
  const { tileId } = req.body || {};
  if (!tileId) return res.status(400).json({ error: 'tileId required' });
  const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
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
  const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
  res.json({ tiles: user.customTiles || [] });
});

app.post('/api/me/custom-tiles', requireAuth, async (req, res) => {
  const { id, label, emoji, imageUrl } = req.body || {};
  if (!id || !label) return res.status(400).json({ error: 'id and label required' });
  const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
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
  const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
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
  const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
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