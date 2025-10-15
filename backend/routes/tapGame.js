import { Router } from 'express';
import { todayInIST } from '../lib/dates.js';
import { scoreForDelta } from '../lib/score.js';
import { TapRound } from '../models/TapRound.js';
import { User } from '../models/User.js';

export const tapGame = Router();

// Pick target from {10,13,34}s
const TARGETS = [10000, 13000, 34000];

tapGame.post('/start', async (req, res) => {
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

tapGame.post('/finish', async (req, res) => {
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
    if (!user) user = await User.create({ clerkId });
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
