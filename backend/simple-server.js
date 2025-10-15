import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { User } from './models/User.js';

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/child_wellness';

async function ensureUser(clerkId, name) {
  let user = await User.findOne({ clerkId });
  if (!user) {
    user = new User({ clerkId, name });
    await user.save();
  }
  return user;
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server is running!' });
});

// Temporary endpoints without auth for testing
app.get('/api/me/stats', async (req, res) => {
  const user = await ensureUser('test-user', 'Test User');
  res.json({
    xp: user.rewards?.xp ?? 0,
    coins: user.rewards?.coins ?? 0,
    hearts: user.rewards?.hearts ?? 5,
    streakDays: user.rewards?.streakDays ?? 0,
    lastPlayedDate: user.rewards?.lastPlayedDate ?? null,
  });
});

app.post('/api/games/record', async (req, res) => {
  const { pointsEarned = 10, coins = 0, xp = 10 } = req.body || {};
  const today = new Date();
  const todayYmd = today.toISOString().slice(0, 10);

  const user = await ensureUser('test-user', 'Test User');
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

const port = 4000;

async function startServer() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    app.listen(port, '0.0.0.0', () => console.log(`Simple server listening on 0.0.0.0:${port}`));
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

startServer();
