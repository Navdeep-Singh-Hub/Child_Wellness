import { SKILL_LOOKUP } from '../constants/skills.js';

const LEVEL_BANDS = [
  { min: 3.5, label: 'Trailblazer', theme: 'advanced' },
  { min: 2.5, label: 'Explorer', theme: 'growing' },
  { min: 1.6, label: 'Adventurer', theme: 'developing' },
  { min: 1, label: 'Starter', theme: 'beginner' },
];

const SKILL_TO_GAME = {
  'color-recognition': { route: '/(tabs)/Games', mode: 'match', title: 'Picture Match' },
  'number-sense': { route: '/(tabs)/Games', mode: 'quiz', title: 'Quiz Challenge' },
  'shape-awareness': { route: '/(tabs)/Games', mode: 'quiz', title: 'Quiz Challenge' },
  'emotion-identification': { route: '/(tabs)/Games', mode: 'emoji', title: 'Find the Emoji' },
  'category-sorting': { route: '/(tabs)/Games', mode: 'sort', title: 'Quick Sort' },
  'timing-control': { route: '/(tabs)/Games', mode: 'tap', title: 'Tap Timing' },
  'aac-communication': { route: '/(tabs)/AACgrid', mode: 'aac', title: 'AAC Grid Practice' },
  'animal-knowledge': { route: '/(tabs)/Games', mode: 'quiz', title: 'Quiz Challenge' },
  'bird-knowledge': { route: '/(tabs)/Games', mode: 'quiz', title: 'Quiz Challenge' },
};

function normalizeSkillsMap(skillsMap = new Map()) {
  if (skillsMap instanceof Map) return skillsMap;
  return new Map(Object.entries(skillsMap || {}));
}

export function levelLabelFor(level = 1) {
  const band = LEVEL_BANDS.find((b) => level >= b.min) || LEVEL_BANDS.at(-1);
  return `${band?.label || 'Starter'} – Level ${Math.max(1, level.toFixed ? level.toFixed(1) : level)}`;
}

function recencyWeight(bucket) {
  if (!bucket?.lastPlayedDate) return 0.6;
  const daysSince = (Date.now() - new Date(bucket.lastPlayedDate).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince <= 2) return 1.2;
  if (daysSince <= 7) return 1;
  if (daysSince <= 14) return 0.8;
  return 0.5;
}

export function computeGlobalLevel(skillsMap) {
  const map = normalizeSkillsMap(skillsMap);
  if (!map.size) return 1;
  let weightedSum = 0;
  let weightTotal = 0;
  map.forEach((bucket) => {
    const level = bucket?.level ?? 1;
    const weight = recencyWeight(bucket);
    weightedSum += level * weight;
    weightTotal += weight;
  });
  return weightTotal ? Number((weightedSum / weightTotal).toFixed(2)) : 1;
}

function describeSkillNeed(skill, bucket) {
  if (!bucket) return 'Not practiced yet';
  if ((bucket.accuracy ?? 0) < 50) return 'Accuracy below 50%';
  if ((bucket.trend ?? 0) < 0) return 'Accuracy trending down';
  if ((bucket.streak ?? 0) === 0) return 'Lost streak recently';
  if (!bucket.lastPlayedDate) return 'Never played';
  const daysSince = Math.floor((Date.now() - new Date(bucket.lastPlayedDate).getTime()) / 86400000);
  if (daysSince > 10) return 'Dormant skill';
  if ((bucket.level ?? 1) <= 2) return 'Ready for guided practice';
  return 'Keep the momentum going';
}

export function buildRecommendations({ skillsMap, limit = 4 }) {
  const map = normalizeSkillsMap(skillsMap);
  const entries = Object.values(SKILL_LOOKUP).map((skill) => {
    const bucket = map.get(skill.id);
    const level = bucket?.level ?? 1;
    const accuracy = bucket?.accuracy ?? 0;
    const reason = describeSkillNeed(skill, bucket);
    const priority =
      accuracy < 50 || level <= 1
        ? 'high'
        : accuracy < 70 || level <= 2
        ? 'medium'
        : 'low';
    const game = SKILL_TO_GAME[skill.id] || { route: '/(tabs)/Games', mode: 'guided', title: 'Practice Session' };
    return {
      id: `${skill.id}-${game.mode}`,
      skillId: skill.id,
      skillTitle: skill.title,
      icon: skill.icon,
      route: game.route,
      gameMode: game.mode,
      activityTitle: `${game.title}`,
      suggestedDifficulty: level >= 3 ? 'adaptive' : 'scaffolded',
      reason,
      priority,
      accuracy,
      level,
      lastPlayedDate: bucket?.lastPlayedDate || null,
    };
  });

  return entries
    .sort((a, b) => {
      if (a.priority === b.priority) {
        return (a.accuracy ?? 0) - (b.accuracy ?? 0);
      }
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, limit);
}

export function buildNextActions({ skillsMap, limit = 3 }) {
  const map = normalizeSkillsMap(skillsMap);

  const dormant = [];
  const weak = [];

  map.forEach((bucket, skillId) => {
    const skill = SKILL_LOOKUP[skillId];
    if (!skill) return;
    const days = bucket?.lastPlayedDate
      ? Math.floor((Date.now() - new Date(bucket.lastPlayedDate).getTime()) / 86400000)
      : Infinity;
    if (days > 10) {
      dormant.push({ skill, bucket, days });
    } else if ((bucket?.accuracy ?? 0) < 60) {
      weak.push({ skill, bucket });
    }
  });

  const cards = [
    ...weak.map(({ skill, bucket }) => ({
      id: `focus-${skill.id}`,
      skillId: skill.id,
      headline: `${skill.title} needs attention`,
      body: `Accuracy is ${bucket?.accuracy ?? 0}%. Try ${skill.tags?.[0] || 'a guided activity'} today.`,
      actionLabel: 'Start session',
      urgency: 'high',
      route: SKILL_TO_GAME[skill.id]?.route || '/(tabs)',
    })),
    ...dormant.map(({ skill, days }) => ({
      id: `dormant-${skill.id}`,
      skillId: skill.id,
      headline: `${skill.title} is dormant`,
      body: `No practice for ${days} days. Schedule a quick refresh.`,
      actionLabel: 'Schedule practice',
      urgency: 'medium',
      route: SKILL_TO_GAME[skill.id]?.route || '/(tabs)',
    })),
  ];

  if (!cards.length) {
    cards.push({
      id: 'keep-going',
      skillId: null,
      headline: 'Great momentum!',
      body: 'All tracked skills are healthy. Keep the streak alive with your favorite activity.',
      actionLabel: 'Open games',
      urgency: 'low',
      route: '/(tabs)/Games',
    });
  }

  return cards.slice(0, limit);
}

