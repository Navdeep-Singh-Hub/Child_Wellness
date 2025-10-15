import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { todayInIST } from './lib/dates.js';
import { scoreForDelta } from './lib/score.js';
import { TapRound } from './models/TapRound.js';
import { User } from './models/User.js';

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/child_wellness';

// Simple auth middleware for testing (bypasses Clerk)
function requireAuth(req, res, next) {
  // For testing, use a dummy user ID
  req.userId = 'test-user-123';
  next();
}

async function ensureUser(clerkId) {
  let user = await User.findOne({ clerkId });
  if (!user) {
    // Create new user with default rewards
    user = new User({ 
      clerkId, 
      name: 'Test User',
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
    console.log(`Created new user: ${clerkId}`);
  }
  return user;
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Pick target from {10,13,34}s
const TARGETS = [10000, 13000, 34000];

app.post('/api/tap/start', requireAuth, async (req, res) => {
  try {
    const clerkId = req.userId; // From requireAuth middleware
    const targetMs = TARGETS[Math.floor(Math.random() * TARGETS.length)];
    const round = await TapRound.create({
      userClerkId: clerkId,
      targetMs,
      startedAt: new Date(),
      status: 'active',
    });
    res.json({ roundId: round._id.toString(), targetSeconds: Math.round(targetMs / 1000) });
  } catch (error) {
    console.error('Error starting tap round:', error);
    res.status(500).json({ error: 'Failed to start round' });
  }
});

app.post('/api/tap/finish', requireAuth, async (req, res) => {
  try {
    const clerkId = req.userId; // From requireAuth middleware
    const { roundId } = req.body || {};
    if (!roundId) return res.status(400).json({ error: 'roundId required' });

    const round = await TapRound.findById(roundId);
    if (!round || round.userClerkId !== clerkId) return res.status(404).json({ error: 'Round not found' });
    if (round.status !== 'active') return res.status(400).json({ error: 'Round already finished' });

    const now = new Date();
    const targetTime = new Date(round.startedAt.getTime() + round.targetMs);
    const deltaMs = Math.abs(now.getTime() - targetTime.getTime());
    const points = scoreForDelta(round.targetMs, deltaMs);

    round.finishedAt = now;
    round.deltaMs = deltaMs;
    round.points = points;
    round.status = 'finished';
    await round.save();

    // Update rewards
    let user = await User.findOne({ clerkId });
    if (!user) user = await ensureUser(clerkId);
    const r = user.rewards || (user.rewards = {});

    // Streak by IST day
    const today = todayInIST();
    if (r.lastPlayedDate !== today) {
      r.streakDays = (r.streakDays ?? 0) + 1; // simple streak for MVP
      r.lastPlayedDate = today;
    }
    r.xp = (r.xp ?? 0) + points;
    r.coins = (r.coins ?? 0) + 1;
    r.totalGamesPlayed = (r.totalGamesPlayed ?? 0) + 1;
    await user.save();

    res.json({
      pointsAwarded: points,
      deltaMs,
      targetSeconds: Math.round(round.targetMs / 1000),
      stats: {
        points: r.xp,
        streakDays: r.streakDays ?? 0,
        totalGamesPlayed: r.totalGamesPlayed ?? 0,
      },
    });
  } catch (error) {
    console.error('Error finishing tap round:', error);
    res.status(500).json({ error: 'Failed to finish round' });
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
    app.listen(port, '0.0.0.0', () => console.log(`Simple API listening on 0.0.0.0:${port}`));
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

startServer();
