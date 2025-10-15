import { clerkClient, clerkMiddleware, getAuth } from '@clerk/express';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { tapGame } from './routes/tapGame.js';

const app = express();
app.use(cors());
app.use(express.json());


// Health check endpoint before Clerk middleware
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use(clerkMiddleware());

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/child_wellness';

async function getUserInfoFromClerk(clerkId) {
  try {
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
  let user = await User.findOne({ clerkId });
  if (!user) {
    // Get user info from Clerk
    const { name } = await getUserInfoFromClerk(clerkId);
    
    // Create new user with default rewards
    user = new User({ 
      clerkId, 
      name,
      rewards: {
        xp: 0,
        coins: 0,
        hearts: 5,
        streakDays: 0,
        lastPlayedDate: null,
        totalGamesPlayed: 0
      }
    });
    await user.save();
    console.log(`Created new user: ${clerkId} with name: ${name}`);
  }
  return user;
}

function requireAuth(req, res, next) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  next();
}

// Add tap game routes
app.use('/api/tap', requireAuth, tapGame);


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