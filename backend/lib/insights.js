import { Session } from '../models/Session.js';
import { SKILL_LOOKUP } from '../constants/skills.js';

function parseRange(range = '30d') {
  if (typeof range === 'number') return Math.max(1, range);
  const match = /^(\d+)\s*d$/i.exec(range);
  return match ? Math.max(1, parseInt(match[1], 10)) : 30;
}

function bucketByDate(logs, rangeDays) {
  const buckets = new Map();
  const cutoff = Date.now() - rangeDays * 86400000;
  logs.forEach((log) => {
    const at = new Date(log.at || log.createdAt || Date.now()).getTime();
    if (Number.isNaN(at) || at < cutoff) return;
    const key = new Date(at).toISOString().slice(0, 10);
    const bucket = buckets.get(key) || {
      date: key,
      xp: 0,
      games: 0,
      accuracySum: 0,
      durationMs: 0,
    };
    bucket.xp += log.xpAwarded || 0;
    bucket.games += 1;
    bucket.accuracySum += log.accuracy || 0;
    bucket.durationMs += log.durationMs || 0;
    buckets.set(key, bucket);
  });
  return Array.from(buckets.values())
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((bucket) => ({
      date: bucket.date,
      xp: bucket.xp,
      games: bucket.games,
      accuracy: bucket.games ? Math.round(bucket.accuracySum / bucket.games) : 0,
      durationMs: bucket.durationMs,
    }));
}

function summarizeSkills(skillsMap) {
  const skills = [];
  const entries = skillsMap instanceof Map ? Array.from(skillsMap.entries()) : Object.entries(skillsMap || {});
  entries.forEach(([skillId, bucket]) => {
    const meta = SKILL_LOOKUP[skillId];
    if (!meta) return;
    skills.push({
      id: skillId,
      title: meta.title,
      icon: meta.icon,
      level: bucket?.level ?? 1,
      accuracy: bucket?.accuracy ?? 0,
      trend: bucket?.trend ?? 0,
      lastPlayedDate: bucket?.lastPlayedDate || null,
    });
  });
  return skills;
}

function splitHighlights(skills) {
  const strengths = [...skills]
    .filter((s) => s.level >= 3 && (s.trend ?? 0) >= 0)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3);
  const focus = [...skills]
    .filter((s) => s.level <= 2 || (s.accuracy ?? 0) < 60)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);
  return { strengths, focus };
}

function feedbackSummary(logs, rangeDays) {
  const cutoff = Date.now() - rangeDays * 86400000;
  const moods = [];
  const notes = [];
  logs.forEach((log) => {
    const at = new Date(log.at || log.createdAt || Date.now()).getTime();
    if (Number.isNaN(at) || at < cutoff) return;
    if (log.feedback?.mood) moods.push(Number(log.feedback.mood));
    if (log.feedback?.notes) {
      notes.push({
        at: new Date(at).toISOString(),
        text: log.feedback.notes,
        observer: log.feedback.observer || null,
      });
    }
  });
  return {
    averageMood: moods.length ? Number((moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1)) : null,
    recentNotes: notes.slice(-5),
  };
}

export async function buildInsights({ userId, range = '30d', rewards }) {
  const rangeDays = parseRange(range);
  const session = await Session.findOne({ userId }).lean();
  const logs = session?.gameLogs || [];
  const dailySeries = bucketByDate(logs, rangeDays);

  const totalGames = dailySeries.reduce((sum, day) => sum + day.games, 0);
  const avgAccuracy =
    dailySeries.length && totalGames
      ? Math.round(dailySeries.reduce((sum, day) => sum + day.accuracy * day.games, 0) / totalGames)
      : rewards?.accuracy ?? 0;

  const skills = summarizeSkills(rewards?.skills || new Map());
  const { strengths, focus } = splitHighlights(skills);
  const feedback = feedbackSummary(logs, rangeDays);

  const modesBreakdown = logs.reduce((acc, log) => {
    const mode = log.mode || 'free-play';
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {});

  return {
    rangeDays,
    dailySeries,
    aggregate: {
      totalGames,
      totalXp: dailySeries.reduce((sum, day) => sum + day.xp, 0),
      avgAccuracy,
      avgSessionMinutes: totalGames
        ? Number(
            (
              dailySeries.reduce((sum, day) => sum + day.durationMs, 0) /
              (totalGames * 60000)
            ).toFixed(1),
          )
        : 0,
    },
    strengths,
    focus,
    skills,
    modesBreakdown,
    feedback,
  };
}

