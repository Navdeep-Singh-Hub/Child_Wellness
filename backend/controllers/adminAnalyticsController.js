/**
 * Admin Analytics Controller
 * Aggregated queries, caching, and AI-based insights for the admin dashboard.
 */

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { UserTherapyProgress } from '../models/TherapyProgress.js';
import { Session } from '../models/Session.js';
import { ActivityLog } from '../models/ActivityLog.js';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min for overview/stats
const REPORT_CACHE_TTL_MS = 2 * 60 * 1000; // 2 min for reports
const cache = new Map(); // key -> { data, expiresAt }

function getCached(key, ttlMs = CACHE_TTL_MS) {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.data;
}

function setCache(key, data, ttlMs = CACHE_TTL_MS) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

function clearCachePrefix(prefix) {
  for (const k of cache.keys()) {
    if (k.startsWith(prefix)) cache.delete(k);
  }
}

function dateRangeFromQuery(query) {
  const range = query?.range || '30d';
  const match = /^(\d+)(d|w|m)$/i.exec(String(range));
  let days = 30;
  if (match) {
    const n = parseInt(match[1], 10);
    if (match[2].toLowerCase() === 'd') days = n;
    else if (match[2].toLowerCase() === 'w') days = n * 7;
    else if (match[2].toLowerCase() === 'm') days = n * 30;
  }
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return { start, end, days };
}

// ─── User Overview ───────────────────────────────────────────────────────

export async function getOverview() {
  const cacheKey = 'admin:overview';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now);
  monthStart.setDate(monthStart.getDate() - 30);

  const [totalUsers, activeDaily, activeWeekly, activeMonthly, therapyCounts, lastActivities] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ updatedAt: { $gte: dayStart } }),
      User.countDocuments({ updatedAt: { $gte: weekStart } }),
      User.countDocuments({ updatedAt: { $gte: monthStart } }),
      getTherapyWiseEnrolledCounts(),
      getLastActivityTimestamps(),
    ]);

  const result = {
    totalUsers,
    activeUsers: { daily: activeDaily, weekly: activeWeekly, monthly: activeMonthly },
    therapyWiseEnrolled: therapyCounts,
    lastActivityTimestamps: lastActivities,
    generatedAt: new Date().toISOString(),
  };
  setCache(cacheKey, result);
  return result;
}

async function getTherapyWiseEnrolledCounts() {
  const docs = await UserTherapyProgress.aggregate([
    { $unwind: '$therapies' },
    { $group: { _id: '$therapies.therapy', count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(docs.map((d) => [d._id, d.count]));
}

async function getLastActivityTimestamps() {
  const lastByUser = await Session.aggregate([
    { $unwind: '$gameLogs' },
    { $sort: { 'gameLogs.at': -1 } },
    {
      $group: {
        _id: '$userId',
        lastAt: { $first: '$gameLogs.at' },
      },
    },
    { $limit: 100 },
  ]);
  return lastByUser.map((d) => ({ userId: d._id, lastActivity: d.lastAt }));
}

// ─── Time Tracking (from Session.gameLogs + ActivityLog) ───────────────────

export async function getTimeTracking(query = {}) {
  const { start, end } = dateRangeFromQuery(query);
  const cacheKey = `admin:time:${start.toISOString()}:${end.toISOString()}`;
  const cached = getCached(cacheKey, REPORT_CACHE_TTL_MS);
  if (cached) return cached;

  const match = { 'gameLogs.at': { $gte: start, $lte: end } };
  if (query.userId) match.userId = new mongoose.Types.ObjectId(query.userId);

  const byTherapy = await Session.aggregate([
    { $match: match },
    { $unwind: '$gameLogs' },
    { $match: { 'gameLogs.at': { $gte: start, $lte: end } } },
    {
      $group: {
        _id: '$gameLogs.meta.therapy', // if app sends therapy in meta
        totalDurationMs: { $sum: '$gameLogs.durationMs' },
        sessions: { $sum: 1 },
      },
    },
  ]);

  const byGame = await Session.aggregate([
    { $match: match },
    { $unwind: '$gameLogs' },
    { $match: { 'gameLogs.at': { $gte: start, $lte: end } } },
    {
      $group: {
        _id: '$gameLogs.type',
        totalDurationMs: { $sum: '$gameLogs.durationMs' },
        plays: { $sum: 1 },
      },
    },
    { $sort: { totalDurationMs: -1 } },
    { $limit: 50 },
  ]);

  const dailyUsage = await Session.aggregate([
    { $match: match },
    { $unwind: '$gameLogs' },
    { $match: { 'gameLogs.at': { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$gameLogs.at' } },
        totalDurationMs: { $sum: '$gameLogs.durationMs' },
        plays: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const result = {
    from: start.toISOString(),
    to: end.toISOString(),
    byTherapy: byTherapy.map((d) => ({
      therapy: d._id || 'unknown',
      totalDurationMs: d.totalDurationMs,
      totalDurationMinutes: Math.round(d.totalDurationMs / 60000),
      sessions: d.sessions,
    })),
    byGame: byGame.map((d) => ({
      gameKey: d._id,
      totalDurationMs: d.totalDurationMs,
      totalDurationMinutes: Math.round(d.totalDurationMs / 60000),
      plays: d.plays,
    })),
    dailyUsage: dailyUsage.map((d) => ({
      date: d._id,
      totalDurationMs: d.totalDurationMs,
      plays: d.plays,
      uniqueUsers: d.uniqueUsers?.length || 0,
    })),
  };
  setCache(cacheKey, result, REPORT_CACHE_TTL_MS);
  return result;
}

// ─── Game Performance ─────────────────────────────────────────────────────

export async function getGamePerformance(query = {}) {
  const { start, end } = dateRangeFromQuery(query);
  const cacheKey = `admin:games:${query.userId || 'all'}:${start.toISOString()}:${end.toISOString()}`;
  const cached = getCached(cacheKey, REPORT_CACHE_TTL_MS);
  if (cached) return cached;

  const match = { 'gameLogs.at': { $gte: start, $lte: end } };
  if (query.userId) match.userId = new mongoose.Types.ObjectId(query.userId);

  const byGame = await Session.aggregate([
    { $match: match },
    { $unwind: '$gameLogs' },
    { $match: { 'gameLogs.at': { $gte: start, $lte: end } } },
    {
      $group: {
        _id: '$gameLogs.type',
        plays: { $sum: 1 },
        totalCorrect: { $sum: '$gameLogs.correct' },
        totalQuestions: { $sum: '$gameLogs.total' },
        totalDurationMs: { $sum: '$gameLogs.durationMs' },
        levels: { $addToSet: '$gameLogs.level' },
      },
    },
    {
      $project: {
        gameKey: '$_id',
        attempts: '$plays',
        totalCorrect: 1,
        totalQuestions: 1,
        accuracy: {
          $cond: [
            { $gt: ['$totalQuestions', 0] },
            { $round: [{ $multiply: [{ $divide: ['$totalCorrect', '$totalQuestions'] }, 100] }, 1] },
            0,
          ],
        },
        avgTimeMs: { $round: [{ $divide: ['$totalDurationMs', '$plays'] }, 0] },
      },
    },
    { $sort: { attempts: -1 } },
    { $limit: 100 },
  ]);

  const result = {
    from: start.toISOString(),
    to: end.toISOString(),
    games: byGame,
  };
  setCache(cacheKey, result, REPORT_CACHE_TTL_MS);
  return result;
}

// ─── Therapy Progress ─────────────────────────────────────────────────────

export async function getTherapyProgress(query = {}) {
  const cacheKey = `admin:therapy:${query.userId || 'all'}`;
  const cached = getCached(cacheKey, REPORT_CACHE_TTL_MS);
  if (cached) return cached;

  const match = {};
  if (query.userId) match.userId = new mongoose.Types.ObjectId(query.userId);

  const docs = await UserTherapyProgress.find(match)
    .populate('userId', 'name email auth0Id')
    .lean();

  const therapyProgress = docs.map((doc) => ({
    userId: doc.userId?._id,
    userName: doc.userId?.name,
    userEmail: doc.userId?.email,
    therapies: (doc.therapies || []).map((t) => ({
      therapy: t.therapy,
      currentLevel: t.currentLevel,
      currentSession: t.currentSession,
      completionPercent: computeTherapyCompletionPercent(t),
      sessionHistory: flattenSessionHistory(t),
      updatedAt: t.updatedAt,
    })),
  }));

  const result = { therapyProgress };
  setCache(cacheKey, result, REPORT_CACHE_TTL_MS);
  return result;
}

function computeTherapyCompletionPercent(t) {
  if (t.sections?.length) {
    const total = t.sections.reduce((acc, s) => acc + (s.levels?.length || 0) * 5, 0);
    let completed = 0;
    t.sections.forEach((s) => {
      s.levels?.forEach((l) => {
        l.games?.forEach((g) => {
          if (g.completed) completed++;
        });
      });
    });
    return total ? Math.round((completed / total) * 100) : 0;
  }
  const total = (t.levels?.length || 0) * (t.levels?.[0]?.sessions?.length || 0) * 5;
  let completed = 0;
  t.levels?.forEach((l) => {
    l.sessions?.forEach((s) => {
      completed += s.completedGames?.length || 0;
    });
  });
  return total ? Math.round((completed / total) * 100) : 0;
}

function flattenSessionHistory(t) {
  const out = [];
  if (t.levels) {
    t.levels.forEach((l) => {
      l.sessions?.forEach((s) => {
        if (s.lastPlayedAt)
          out.push({
            level: l.levelNumber,
            session: s.sessionNumber,
            completed: s.completed,
            lastPlayedAt: s.lastPlayedAt,
          });
      });
    });
  }
  return out.sort((a, b) => new Date(b.lastPlayedAt) - new Date(a.lastPlayedAt));
}

// ─── Reports (filter, top users, need attention, drop-offs) ───────────────

export async function getReports(query = {}) {
  const { start, end } = dateRangeFromQuery(query);
  const userId = query.userId ? new mongoose.Types.ObjectId(query.userId) : null;
  const therapy = query.therapy || null;

  const baseMatch = { 'gameLogs.at': { $gte: start, $lte: end } };
  if (userId) baseMatch.userId = userId;

  const [topUsers, lowActivityUsers, mostPlayedGames, gameDropOff] = await Promise.all([
    getTopPerformingUsers(start, end, therapy),
    getUsersNeedingAttention(start, end),
    getMostPlayedGames(start, end, userId),
    getDropOffPoints(start, end),
  ]);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
    topPerformingUsers: topUsers,
    usersNeedingAttention: lowActivityUsers,
    mostPlayedGames,
    dropOffPoints: gameDropOff,
  };
}

async function getTopPerformingUsers(start, end, therapy) {
  const match = { 'gameLogs.at': { $gte: start, $lte: end } };
  const unwind = [{ $unwind: '$gameLogs' }, { $match: { 'gameLogs.at': { $gte: start, $lte: end } } }];
  if (therapy) {
    unwind.push({ $match: { 'gameLogs.meta.therapy': therapy } });
  }
  const agg = await Session.aggregate([
    { $match: match },
    ...unwind,
    {
      $group: {
        _id: '$userId',
        totalCorrect: { $sum: '$gameLogs.correct' },
        totalQuestions: { $sum: '$gameLogs.total' },
        gamesPlayed: { $sum: 1 },
        totalDurationMs: { $sum: '$gameLogs.durationMs' },
      },
    },
    { $match: { totalQuestions: { $gt: 0 } } },
    {
      $addFields: {
        accuracy: { $multiply: [{ $divide: ['$totalCorrect', '$totalQuestions'] }, 100] },
      },
    },
    { $sort: { accuracy: -1, gamesPlayed: -1 } },
    { $limit: 20 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        userId: '$_id',
        name: '$user.name',
        email: '$user.email',
        accuracy: { $round: ['$accuracy', 1] },
        gamesPlayed: 1,
        totalDurationMinutes: { $round: [{ $divide: ['$totalDurationMs', 60000] }, 1] },
      },
    },
  ]);
  return agg;
}

async function getUsersNeedingAttention(start, end) {
  const allUsers = await User.find({}, { _id: 1, name: 1, email: 1, updatedAt: 1 }).lean();
  const activeUserIds = await Session.distinct('userId', {
    'gameLogs.at': { $gte: start, $lte: end },
  });
  const activeSet = new Set(activeUserIds.map(String));
  const inactive = allUsers.filter((u) => !activeSet.has(String(u._id)));
  const withLowAccuracy = await Session.aggregate([
    { $match: { 'gameLogs.at': { $gte: start, $lte: end } } },
    { $unwind: '$gameLogs' },
    {
      $group: {
        _id: '$userId',
        avgAcc: { $avg: '$gameLogs.accuracy' },
        games: { $sum: 1 },
      },
    },
    { $match: { avgAcc: { $lt: 50 }, games: { $gte: 3 } } },
    { $limit: 30 },
  ]);
  const lowAccIds = new Set(withLowAccuracy.map((d) => String(d._id)));
  return {
    inactiveUsers: inactive.slice(0, 50).map((u) => ({ userId: u._id, name: u.name, email: u.email, reason: 'no_activity' })),
    lowAccuracyUsers: withLowAccuracy.map((d) => ({
      userId: d._id,
      avgAccuracy: Math.round(d.avgAcc),
      gamesPlayed: d.games,
      reason: 'low_accuracy',
    })),
  };
}

async function getMostPlayedGames(start, end, userId) {
  const match = { 'gameLogs.at': { $gte: start, $lte: end } };
  if (userId) match.userId = userId;
  const agg = await Session.aggregate([
    { $match: match },
    { $unwind: '$gameLogs' },
    { $group: { _id: '$gameLogs.type', plays: { $sum: 1 }, uniqueUsers: { $addToSet: '$userId' } } },
    { $sort: { plays: -1 } },
    { $limit: 30 },
  ]);
  return agg.map((d) => ({ gameKey: d._id, plays: d.plays, uniqueUsers: d.uniqueUsers?.length || 0 }));
}

async function getDropOffPoints(start, end) {
  const byGame = await Session.aggregate([
    { $match: { 'gameLogs.at': { $gte: start, $lte: end } } },
    { $unwind: '$gameLogs' },
    {
      $group: {
        _id: '$gameLogs.type',
        totalStarts: { $sum: 1 },
        completed: { $sum: { $cond: [{ $gte: ['$gameLogs.total', 1] }, 1, 0] } },
        avgLevel: { $avg: '$gameLogs.level' },
      },
    },
    { $match: { totalStarts: { $gte: 5 } } },
    {
      $project: {
        gameKey: '$_id',
        totalStarts: 1,
        completed: 1,
        completionRate: { $multiply: [{ $divide: ['$completed', '$totalStarts'] }, 100] },
      },
    },
    { $sort: { completionRate: 1 } },
    { $limit: 20 },
  ]);
  return byGame;
}

// ─── AI-Based Insights ────────────────────────────────────────────────────

export async function getAIInsights(query = {}) {
  const { start, end } = dateRangeFromQuery(query);
  const userId = query.userId ? new mongoose.Types.ObjectId(query.userId) : null;
  const cacheKey = `admin:insights:${userId || 'all'}:${start.toISOString()}`;
  const cached = getCached(cacheKey, REPORT_CACHE_TTL_MS);
  if (cached) return cached;

  const match = { 'gameLogs.at': { $gte: start, $lte: end } };
  if (userId) match.userId = userId;

  const logs = await Session.aggregate([
    { $match: match },
    { $unwind: '$gameLogs' },
    { $match: { 'gameLogs.at': { $gte: start, $lte: end }, 'gameLogs.total': { $gt: 0 } } },
    {
      $project: {
        userId: 1,
        at: '$gameLogs.at',
        accuracy: '$gameLogs.accuracy',
        durationMs: '$gameLogs.durationMs',
        type: '$gameLogs.type',
      },
    },
    { $sort: { at: 1 } },
  ]);

  const byUser = new Map();
  logs.forEach((log) => {
    const id = String(log.userId);
    if (!byUser.has(id)) byUser.set(id, []);
    byUser.get(id).push(log);
  });

  const insights = [];
  for (const [uid, userLogs] of byUser) {
    const improvementTrend = computeImprovementTrend(userLogs);
    const engagementScore = computeEngagementScore(userLogs, start, end);
    const therapyEffectiveness = computeTherapyEffectivenessScore(userLogs);
    insights.push({
      userId: uid,
      improvementTrend,
      engagementScore,
      therapyEffectivenessScore: therapyEffectiveness,
      sampleSize: userLogs.length,
    });
  }

  const result = {
    from: start.toISOString(),
    to: end.toISOString(),
    insights: userId ? insights[0] || null : insights,
  };
  setCache(cacheKey, result, REPORT_CACHE_TTL_MS);
  return result;
}

function computeImprovementTrend(logs) {
  if (logs.length < 5) return { trend: 'insufficient_data', value: 0 };
  const sorted = [...logs].sort((a, b) => new Date(a.at) - new Date(b.at));
  const half = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, half);
  const secondHalf = sorted.slice(half);
  const avgFirst = firstHalf.reduce((s, l) => s + (l.accuracy || 0), 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, l) => s + (l.accuracy || 0), 0) / secondHalf.length;
  const diff = avgSecond - avgFirst;
  let trend = 'stable';
  if (diff > 5) trend = 'improving';
  else if (diff < -5) trend = 'declining';
  return { trend, value: Math.round(diff * 10) / 10, avgFirst: Math.round(avgFirst), avgSecond: Math.round(avgSecond) };
}

function computeEngagementScore(logs, start, end) {
  const days = (end - start) / (24 * 60 * 60 * 1000);
  const uniqueDays = new Set(logs.map((l) => new Date(l.at).toISOString().slice(0, 10))).size;
  const totalMinutes = logs.reduce((s, l) => s + (l.durationMs || 0) / 60000, 0);
  const frequencyScore = Math.min(100, (uniqueDays / Math.max(days, 1)) * 100);
  const durationScore = Math.min(100, (totalMinutes / Math.max(days * 10, 1)) * 100);
  const score = Math.round(0.5 * frequencyScore + 0.5 * durationScore);
  return {
    score: Math.min(100, score),
    uniqueDaysActive: uniqueDays,
    totalMinutes,
    frequencyScore: Math.round(frequencyScore),
    durationScore: Math.round(durationScore),
  };
}

function computeTherapyEffectivenessScore(logs) {
  if (logs.length === 0) return { score: 0, avgAccuracy: 0 };
  const avgAccuracy = logs.reduce((s, l) => s + (l.accuracy || 0), 0) / logs.length;
  const completionWeight = Math.min(100, logs.length * 2);
  const score = Math.round(0.7 * avgAccuracy + 0.3 * completionWeight);
  return { score: Math.min(100, score), avgAccuracy: Math.round(avgAccuracy), sessions: logs.length };
}

// ─── Single User Full Journey ─────────────────────────────────────────────

function ageFromDob(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

// Read profile fields from doc; support both schema names and DB variants (e.g. authId vs auth0Id)
function pick(obj, ...keys) {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

function toUserInfo(u) {
  if (!u) return null;
  const dob = pick(u, 'dob', 'DOB');
  const gender = pick(u, 'gender', 'Gender');
  const phoneNumber = pick(u, 'phoneNumber', 'phone');
  const phoneCountryCode = pick(u, 'phoneCountryCode', 'PhoneCountryCode');
  const age = ageFromDob(dob);
  const phone = [phoneCountryCode, phoneNumber].filter(Boolean).join(' ').trim() || null;
  return {
    id: u._id,
    name: pick(u, 'name') ?? '',
    email: pick(u, 'email') ?? '',
    auth0Id: pick(u, 'auth0Id', 'authId'),
    firstName: pick(u, 'firstName', 'FirstName'),
    lastName: pick(u, 'lastName', 'LastName'),
    phoneNumber: phoneNumber || null,
    phoneCountryCode: phoneCountryCode || null,
    phone: phone || null,
    dob: dob ? new Date(dob).toISOString().slice(0, 10) : null,
    age: age,
    gender: gender || null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function getUserFullJourney(userId) {
  const id = new mongoose.Types.ObjectId(userId);
  const [user, progress, sessions] = await Promise.all([
    User.findById(id).lean(),
    UserTherapyProgress.findOne({ userId: id }).lean(),
    Session.findOne({ userId: id }).sort({ 'gameLogs.at': -1 }).lean(),
  ]);
  if (!user) return null;
  const gameLogs = sessions?.gameLogs?.slice(0, 200) || [];
  const { start, end } = dateRangeFromQuery({ range: '90d' });
  const recentLogs = gameLogs.filter((g) => g.at && new Date(g.at) >= start);
  const insights = await getAIInsights({ userId: userId, range: '90d' });
  return {
    user: toUserInfo(user),
    therapyProgress: progress?.therapies || [],
    recentGameLogs: recentLogs.slice(0, 100),
    aiInsights: insights?.insights || null,
  };
}

// ─── List Users (paginated) ───────────────────────────────────────────────

export async function listUsers(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(10, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const search = query.search ? { $or: [{ name: new RegExp(query.search, 'i') }, { email: new RegExp(query.search, 'i') }] } : {};
  // Use raw collection so we read exact DB fields (authId, LastName, dob, gender, etc.)
  const coll = User.collection;
  const [rawUsers, total] = await Promise.all([
    coll.find(search).sort({ updatedAt: -1 }).skip(skip).limit(limit).toArray(),
    coll.countDocuments(search),
  ]);
  if (rawUsers.length > 0 && process.env.NODE_ENV !== 'production') {
    const first = rawUsers[0];
    const dob = pick(first, 'dob', 'DOB');
    console.log('[admin listUsers] first user:', pick(first, 'email'), 'dob:', !!dob, 'gender:', pick(first, 'gender', 'Gender'), 'phone:', !!pick(first, 'phoneNumber', 'phone'));
  }
  const users = rawUsers.map((u) => toUserInfo(u));
  return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

// ─── Admin update user profile (phone, DOB, gender) ────────────────────────

const GENDER_VALUES = ['male', 'female', 'other', 'prefer-not-to-say'];

export async function updateUserProfile(userId, body = {}) {
  const id = new mongoose.Types.ObjectId(userId);
  const user = await User.findById(id);
  if (!user) return null;
  const { firstName, lastName, dob, gender, phoneCountryCode, phoneNumber } = body;
  if (typeof firstName === 'string') user.firstName = firstName.trim();
  if (typeof lastName === 'string') user.lastName = lastName.trim();
  if (typeof dob === 'string' && dob.trim()) {
    const trimmed = dob.trim();
    const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const parsed = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
      if (!Number.isNaN(parsed.getTime())) user.dob = parsed;
    }
  }
  if (gender && GENDER_VALUES.includes(gender)) user.gender = gender;
  if (typeof phoneCountryCode === 'string' && phoneCountryCode.trim()) {
    user.phoneCountryCode = phoneCountryCode.trim();
  }
  if (typeof phoneNumber === 'string' && phoneNumber.trim()) {
    user.phoneNumber = phoneNumber.replace(/\D/g, '');
  }
  user.name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name;
  await user.save();
  return toUserInfo(user.toObject?.() ?? user);
}

export { clearCachePrefix, setCache, getCached };
