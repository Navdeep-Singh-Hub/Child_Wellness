import { Router } from 'express';
import mongoose from 'mongoose';

import { SmartScene } from '../models/SmartScene.js';
import { SmartItem } from '../models/SmartItem.js';
import { SmartPrompt } from '../models/SmartPrompt.js';
import { SmartExplorerSession } from '../models/SmartExplorerSession.js';
import { SmartExplorerTurn } from '../models/SmartExplorerTurn.js';
import { User } from '../models/User.js';

const smartExplorerRouter = Router();

const DIFFICULTY_ORDER = ['tierA', 'tierB', 'tierC', 'tierD'];
const TARGET_TIME_MS = {
  tierA: 12000,
  tierB: 12000,
  tierC: 15000,
  tierD: 20000,
};
const MAX_PROMPTS_BY_MODE = {
  learn: 9999,
  play: 10,
  therapy: 9999,
};
const EWMA_ALPHA = 0.3;

smartExplorerRouter.get('/scenes', async (_req, res) => {
  try {
    const scenes = await SmartScene.find({})
      .lean()
      .select({ slug: 1, title: 1, imageUrl: 1, meta: 1 })
      .sort({ title: 1 });

    const sceneIds = scenes.map((scene) => scene._id);
    const itemCounts = await SmartItem.aggregate([
      { $match: { sceneId: { $in: sceneIds } } },
      { $group: { _id: '$sceneId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(itemCounts.map((c) => [String(c._id), c.count]));

    res.json({
      scenes: scenes.map((scene) => ({
        ...scene,
        itemCount: countMap.get(String(scene._id)) || 0,
      })),
    });
  } catch (error) {
    console.error('smart-explorer scenes error', error);
    res.status(500).json({ ok: false, error: 'Failed to load scenes' });
  }
});

smartExplorerRouter.get('/scenes/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const scene = await SmartScene.findOne({ slug }).lean();
    if (!scene) return res.status(404).json({ ok: false, error: 'Scene not found' });

    const [items, prompts] = await Promise.all([
      SmartItem.find({ sceneId: scene._id }).lean(),
      SmartPrompt.find({ sceneId: scene._id }).lean(),
    ]);

    res.json({ scene, items, prompts });
  } catch (error) {
    console.error('smart-explorer scene detail error', error);
    res.status(500).json({ ok: false, error: 'Failed to load scene' });
  }
});

smartExplorerRouter.post('/sessions/start', async (req, res) => {
  try {
    const user = await ensureUserDoc(req);
    if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    const { sceneSlug, mode = 'learn' } = req.body || {};
    if (!sceneSlug) return res.status(400).json({ ok: false, error: 'sceneSlug required' });
    if (!['learn', 'play', 'therapy'].includes(mode)) {
      return res.status(400).json({ ok: false, error: 'Invalid mode' });
    }

    const scene = await SmartScene.findOne({ slug: sceneSlug });
    if (!scene) return res.status(404).json({ ok: false, error: 'Scene not found' });

    const startDifficulty = getStartingDifficulty(user, sceneSlug);

    const session = await SmartExplorerSession.create({
      userId: user._id,
      mode,
      sceneId: scene._id,
      difficultyStart: startDifficulty,
      meta: {
        difficulty: startDifficulty,
        promptHistory: [],
        correctStreak: 0,
        missStreak: 0,
        currentStreak: 0,
        maxPrompts: MAX_PROMPTS_BY_MODE[mode] ?? 10,
      },
    });

    const initialPrompt = await selectPrompt(scene._id, startDifficulty, []);

    if (initialPrompt) {
      await SmartExplorerSession.findByIdAndUpdate(session._id, {
        $set: { 'meta.promptHistory': [initialPrompt._id] },
      });
    }

    res.json({
      ok: true,
      session: {
        id: session._id,
        sceneId: session.sceneId,
        mode: session.mode,
        difficulty: startDifficulty,
        meta: session.meta,
      },
      prompt: initialPrompt,
    });
  } catch (error) {
    console.error('smart-explorer start error', error);
    res.status(500).json({ ok: false, error: 'Failed to start session' });
  }
});

smartExplorerRouter.post('/sessions/:sessionId/prompt', async (req, res) => {
  try {
    const user = await ensureUserDoc(req);
    if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    const { sessionId } = req.params;
    const {
      promptId,
      correct,
      responseTimeMs,
      incorrectTaps = 0,
      hintsUsed = [],
      events = [],
    } = req.body || {};

    if (!promptId) return res.status(400).json({ ok: false, error: 'promptId required' });

    const session = await SmartExplorerSession.findById(sessionId);
    if (!session) return res.status(404).json({ ok: false, error: 'Session not found' });
    if (String(session.userId) !== String(user._id)) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }

    const prompt = await SmartPrompt.findById(promptId);
    if (!prompt) {
      return res.status(404).json({ ok: false, error: 'Prompt not found' });
    }

    if (!session.meta) session.meta = {};

    const scene = await SmartScene.findById(session.sceneId);

    // Record analytics events
    const turnDocs = [];
    if (Array.isArray(events) && events.length) {
      events.forEach((event) => {
        turnDocs.push({
          sessionId: session._id,
          promptId,
          event: event.event,
          data: event.data || {},
          correct: typeof event.correct === 'boolean' ? event.correct : null,
        });
      });
    }

    turnDocs.push({
      sessionId: session._id,
      promptId,
      event: 'prompt_resolved',
      data: {
        correct,
        responseTimeMs,
        incorrectTaps,
        hintsUsed,
        difficulty: session.meta.difficulty || session.difficultyStart,
      },
      correct: !!correct,
    });

    await SmartExplorerTurn.insertMany(turnDocs);

    // Update session stats
    session.totalPrompts = (session.totalPrompts || 0) + 1;
    if (correct) session.correctPrompts = (session.correctPrompts || 0) + 1;
    session.accuracy = Math.round(
      (session.correctPrompts / Math.max(1, session.totalPrompts)) * 100,
    );

    // scoring
    const scoreDelta = calculateScore({
      correct,
      incorrectTaps,
      responseTimeMs,
      difficulty: session.meta.difficulty || session.difficultyStart,
    });
    session.score = (session.score || 0) + scoreDelta;

    // streak tracking
    if (!session.meta.currentStreak) session.meta.currentStreak = 0;
    if (correct) {
      session.meta.currentStreak += 1;
      session.streakAchieved = Math.max(
        session.streakAchieved || 0,
        session.meta.currentStreak,
      );
    } else {
      session.meta.currentStreak = 0;
    }

    // Difficulty adjustments
    const difficultyState = {
      correctStreak: session.meta.correctStreak || 0,
      missStreak: session.meta.missStreak || 0,
      difficulty: session.meta.difficulty || session.difficultyStart,
    };

    const { nextDifficulty, correctStreak, missStreak } = adjustDifficulty({
      state: difficultyState,
      correct,
      responseTimeMs,
    });

    session.meta.correctStreak = correctStreak;
    session.meta.missStreak = missStreak;
    session.meta.difficulty = nextDifficulty;

    // Prompt history to avoid immediate repeats
    const history = Array.isArray(session.meta.promptHistory)
      ? session.meta.promptHistory
      : [];
    history.push(new mongoose.Types.ObjectId(promptId));
    session.meta.promptHistory = history.slice(-50); // prevent unbounded growth

    const maxPrompts = session.meta.maxPrompts || MAX_PROMPTS_BY_MODE[session.mode] || 10;
    let nextPrompt = null;

    if (session.totalPrompts >= maxPrompts) {
      session.endedAt = new Date();
      session.difficultyEnd = nextDifficulty;
    } else {
      nextPrompt = await selectPrompt(
        session.sceneId,
        nextDifficulty,
        session.meta.promptHistory,
      );

      if (nextPrompt) {
        session.meta.promptHistory.push(nextPrompt._id);
      } else {
        session.endedAt = new Date();
        session.difficultyEnd = nextDifficulty;
      }
    }

    await session.save();

    // Update user rewards/stats
    await updateUserAfterPrompt({
      user,
      scene,
      correct,
      scoreDelta,
      session,
    });

    res.json({
      ok: true,
      session: {
        id: session._id,
        score: session.score,
        accuracy: session.accuracy,
        totalPrompts: session.totalPrompts,
        correctPrompts: session.correctPrompts,
        difficulty: session.meta.difficulty,
        ended: !!session.endedAt,
      },
      rewardSnapshot: buildRewardSnapshot(user),
      nextPrompt,
    });
  } catch (error) {
    console.error('smart-explorer prompt error', error);
    res.status(500).json({ ok: false, error: 'Failed to process prompt' });
  }
});

smartExplorerRouter.post('/sessions/:sessionId/complete', async (req, res) => {
  try {
    const user = await ensureUserDoc(req);
    if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    const { sessionId } = req.params;
    const session = await SmartExplorerSession.findById(sessionId);
    if (!session) return res.status(404).json({ ok: false, error: 'Session not found' });
    if (String(session.userId) !== String(user._id)) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }

    if (!session.endedAt) {
      session.endedAt = new Date();
      session.difficultyEnd = session.meta?.difficulty || session.difficultyStart;
      await session.save();
    }

    const scene = await SmartScene.findById(session.sceneId);
    await updateUserAfterSession({ user, scene, session });

    res.json({
      ok: true,
      session: {
        id: session._id,
        score: session.score,
        accuracy: session.accuracy,
        totalPrompts: session.totalPrompts,
        correctPrompts: session.correctPrompts,
        streakAchieved: session.streakAchieved,
      },
      rewardSnapshot: buildRewardSnapshot(user),
    });
  } catch (error) {
    console.error('smart-explorer complete error', error);
    res.status(500).json({ ok: false, error: 'Failed to complete session' });
  }
});

function getStartingDifficulty(user, sceneSlug) {
  const stats = user.rewards?.smartExplorer;
  if (!stats) return 'tierA';

  const mastery = stats.sceneMastery?.get?.(sceneSlug);
  if (mastery?.tierUnlocked) return mastery.tierUnlocked;

  const accuracy = stats.accuracy || 0;
  if (accuracy >= 85) return 'tierC';
  if (accuracy >= 70) return 'tierB';
  return 'tierA';
}

async function selectPrompt(sceneId, difficulty, excludeIds = []) {
  const excludeObjectIds = excludeIds
    .filter(Boolean)
    .map((id) => new mongoose.Types.ObjectId(id));

  for (let i = 0; i < DIFFICULTY_ORDER.length; i += 1) {
    const tier = DIFFICULTY_ORDER[i];
    if (tier !== difficulty) continue;

    const prompt = await samplePrompt(sceneId, tier, excludeObjectIds);
    if (prompt) return prompt;
  }

  // fallback to easier tiers if we ran out
  const currentIndex = DIFFICULTY_ORDER.indexOf(difficulty);
  for (let idx = currentIndex; idx >= 0; idx -= 1) {
    const tier = DIFFICULTY_ORDER[idx];
    const prompt = await samplePrompt(sceneId, tier, excludeObjectIds);
    if (prompt) return prompt;
  }

  return null;
}

async function samplePrompt(sceneId, difficulty, exclude = []) {
  const match = {
    sceneId: new mongoose.Types.ObjectId(sceneId),
    difficulty,
  };
  if (exclude.length) {
    match._id = { $nin: exclude };
  }
  const pipeline = [{ $match: match }, { $sample: { size: 1 } }];
  const docs = await SmartPrompt.aggregate(pipeline);
  return docs[0] || null;
}

function adjustDifficulty({ state, correct, responseTimeMs }) {
  let { difficulty } = state;
  let correctStreak = state.correctStreak || 0;
  let missStreak = state.missStreak || 0;

  if (correct) {
    correctStreak += 1;
    missStreak = 0;
  } else {
    missStreak += 1;
    correctStreak = 0;
  }

  const currentIndex = DIFFICULTY_ORDER.indexOf(difficulty);
  const targetTime = TARGET_TIME_MS[difficulty] || 15000;

  if (correct && responseTimeMs != null && responseTimeMs < targetTime * 0.5 && correctStreak >= 3) {
    difficulty = DIFFICULTY_ORDER[Math.min(DIFFICULTY_ORDER.length - 1, currentIndex + 1)];
    correctStreak = 0;
    missStreak = 0;
  } else if (!correct && missStreak >= 2) {
    difficulty = DIFFICULTY_ORDER[Math.max(0, currentIndex - 1)];
    correctStreak = 0;
    missStreak = 0;
  }

  return { nextDifficulty: difficulty, correctStreak, missStreak };
}

function calculateScore({ correct, incorrectTaps, responseTimeMs, difficulty }) {
  if (!correct) return Math.max(25, 100 - incorrectTaps * 25);

  const base = 100;
  const penalty = incorrectTaps * 25;
  const timer = TARGET_TIME_MS[difficulty] || 15000;
  let bonus = 0;
  if (responseTimeMs != null && timer && responseTimeMs < timer * 0.5) {
    bonus = 25;
  }
  return Math.max(25, base - penalty + bonus);
}

async function ensureUserDoc(req) {
  const auth0Id = req.auth0Id || req.userId;
  if (!auth0Id) return null;

  const email = req.auth0Email || '';
  const name = req.auth0Name || '';

  return User.findOneAndUpdate(
    { auth0Id },
    {
      $setOnInsert: {
        auth0Id,
        email,
        name: name || email || 'Explorer',
        rewards: {},
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
}

async function updateUserAfterPrompt({ user, scene, correct, scoreDelta, session }) {
  if (!user.rewards) user.rewards = {};
  const rewards = user.rewards;

  // XP + coins (coins optional)
  rewards.xp = (rewards.xp || 0) + Math.max(0, scoreDelta);
  rewards.coins = rewards.coins || 0;

  // Hearts logic: lose heart on incorrect, regen slightly on success
  rewards.hearts = rewards.hearts ?? 5;
  if (correct) {
    rewards.hearts = Math.min(5, rewards.hearts + 0);
  } else {
    rewards.hearts = Math.max(0, rewards.hearts - 1);
  }

  // Global accuracy counters
  rewards.correctSum = (rewards.correctSum || 0) + (correct ? 1 : 0);
  rewards.totalSum = (rewards.totalSum || 0) + 1;
  rewards.accuracy = Math.round(
    (rewards.correctSum / Math.max(1, rewards.totalSum)) * 100,
  );

  // Daily streak (reuse logic similar to games record)
  const today = new Date();
  const todayYmd = today.toISOString().slice(0, 10);
  const prevDate = rewards.lastPlayedDate;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayYmd = yesterday.toISOString().slice(0, 10);

  if (!prevDate) {
    rewards.streakDays = 1;
  } else if (prevDate === todayYmd) {
    // same day, keep
  } else if (prevDate === yesterdayYmd) {
    rewards.streakDays = (rewards.streakDays || 0) + 1;
  } else {
    rewards.streakDays = 1;
  }

  rewards.lastPlayedDate = todayYmd;
  rewards.bestStreak = Math.max(rewards.bestStreak || 0, rewards.streakDays || 0);

  // Smart Explorer stats
  if (!rewards.smartExplorer) rewards.smartExplorer = {};
  const stats = rewards.smartExplorer;
  stats.totalPrompts = (stats.totalPrompts || 0) + 1;
  stats.correctPrompts = (stats.correctPrompts || 0) + (correct ? 1 : 0);
  stats.accuracy = Math.round(
    (stats.correctPrompts / Math.max(1, stats.totalPrompts)) * 100,
  );
  stats.bestStreak = Math.max(stats.bestStreak || 0, session.streakAchieved || 0);
  stats.lastPlayedDate = todayYmd;

  if (!stats.sceneMastery) {
    stats.sceneMastery = new Map();
  } else if (!(stats.sceneMastery instanceof Map) && typeof stats.sceneMastery === 'object') {
    stats.sceneMastery = new Map(Object.entries(stats.sceneMastery));
  }

  const sceneKey = scene?.slug || String(scene?._id);
  const currentSceneStats =
    (stats.sceneMastery.get && stats.sceneMastery.get(sceneKey)) || {
      ewmaAccuracy: 0,
      promptsSeen: 0,
      tierUnlocked: 'tierA',
      badges: [],
    };

  currentSceneStats.promptsSeen += 1;
  const promptAccuracy = correct ? 100 : 0;
  currentSceneStats.ewmaAccuracy =
    currentSceneStats.ewmaAccuracy == null
      ? promptAccuracy
      : EWMA_ALPHA * promptAccuracy + (1 - EWMA_ALPHA) * currentSceneStats.ewmaAccuracy;

  // Update tier unlocked based on achieved difficulty
  const currentTierIndex = DIFFICULTY_ORDER.indexOf(currentSceneStats.tierUnlocked || 'tierA');
  const achievedIndex = DIFFICULTY_ORDER.indexOf(session.meta?.difficulty || session.difficultyStart);
  if (achievedIndex > currentTierIndex) {
    currentSceneStats.tierUnlocked = DIFFICULTY_ORDER[achievedIndex];
  }

  // Milestones
  const milestones = [60, 75, 90];
  const badges = new Set(currentSceneStats.badges || []);
  milestones.forEach((threshold) => {
    const badgeId = `scene_${sceneKey}_${threshold}`;
    if (
      currentSceneStats.ewmaAccuracy >= threshold &&
      !badges.has(badgeId)
    ) {
      badges.add(badgeId);
    }
  });
  currentSceneStats.badges = Array.from(badges);

  if (stats.sceneMastery.set) {
    stats.sceneMastery.set(sceneKey, currentSceneStats);
  } else {
    // plain object fallback
    stats.sceneMastery[sceneKey] = currentSceneStats;
  }

  user.markModified('rewards');
  user.markModified('rewards.smartExplorer');
  user.markModified('rewards.smartExplorer.sceneMastery');

  await user.save();
}

async function updateUserAfterSession({ user, scene, session }) {
  if (!user.rewards) return;
  const stats = user.rewards.smartExplorer;
  if (!stats) return;
  stats.bestStreak = Math.max(stats.bestStreak || 0, session.streakAchieved || 0);
  user.markModified('rewards.smartExplorer.bestStreak');
  await user.save();
}

function buildRewardSnapshot(user) {
  const rewards = user.rewards || {};
  return {
    xp: rewards.xp || 0,
    coins: rewards.coins || 0,
    hearts: rewards.hearts ?? 5,
    accuracy: rewards.accuracy || 0,
    smartExplorer: {
      totalPrompts: rewards.smartExplorer?.totalPrompts || 0,
      correctPrompts: rewards.smartExplorer?.correctPrompts || 0,
      accuracy: rewards.smartExplorer?.accuracy || 0,
      bestStreak: rewards.smartExplorer?.bestStreak || 0,
      lastPlayedDate: rewards.smartExplorer?.lastPlayedDate || null,
    },
  };
}

export { smartExplorerRouter };

