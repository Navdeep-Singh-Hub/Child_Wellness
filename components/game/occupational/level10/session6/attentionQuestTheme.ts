/**
 * OT Level 10 · Session 6 · Game 3 — Attention Quest · "Quest Trail"
 *
 * Gold + emerald adventure palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const QUEST_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.35)',
  statLabel: '#A5B4FC',
  statValue: '#FFFBEB',
  statBorder: 'rgba(165,180,252,0.45)',
  stageBorder: 'rgba(245,158,11,0.55)',
  stageBg: 'rgba(15,23,42,0.86)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#F59E0B',
  glassBorder: 'rgba(245,158,11,0.35)',
  academyLabel: 'ATTENTION LAB',
  trail: '#84CC16',
  quest: '#F59E0B',
} as const;

export type QuestNode = 'forest' | 'bridge' | 'mountain' | 'crystal' | 'crown';

export type AttentionQuestRound = {
  id: string;
  node: QuestNode;
  label: string;
  emoji: string;
  color: string;
  trail: Point & { radius: number };
  quest: Point & { radius: number };
  voiceTrail: string;
  voiceQuest: string;
  questCue: string;
};

export const ATTENTION_QUEST_THEME = {
  title: 'Attention Quest',
  subtitle: 'Follow the quest trail — then complete each attention challenge with calm focus!',
  emoji: '🗺️',
  hero: '⚔️',
  accent: '#F59E0B',
  accentEmerald: '#10B981',
  glow: 'rgba(245,158,11,0.5)',
  bgGradient: ['#0F172A', '#78350F', '#14532D', '#312E81'] as [string, string, string, string],
  decor: ['🗺️', '⚔️', '🌲', '🌉', '⛰️', '💎', '👑', '✨'],
  hintText: 'Walk the trail to each quest node — then hold your attention challenge!',
  positionCue: 'Face the camera so we can track your quest movement and focus.',
  trailLabel: 'TRAIL!',
  questLabel: 'QUEST LOCK!',
  holdTrailLabel: 'ON TRAIL!',
  holdQuestLabel: 'QUEST HOLD!',
  voiceIntro:
    'Welcome to the Attention Quest! Each round you follow the trail to a quest node — then lock your attention with calm posture and steady focus.',
  voiceComplete: 'Quest complete! You finished every attention challenge like a true adventurer!',
  congrats: 'Attention Quest Hero!',
  skillTags: [
    'attention-regulation',
    'motor-planning',
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
  ],
} as const;

const qr = (
  id: string,
  node: QuestNode,
  label: string,
  emoji: string,
  color: string,
  trail: Point,
  quest: Point,
  voiceTrail: string,
  voiceQuest: string,
  questCue: string,
): AttentionQuestRound => ({
  id,
  node,
  label,
  emoji,
  color,
  trail: { ...trail, radius: 0.105 },
  quest: { ...quest, radius: 0.1 },
  voiceTrail,
  voiceQuest,
  questCue,
});

export const ATTENTION_QUEST_ROUNDS: AttentionQuestRound[] = [
  qr(
    'forest',
    'forest',
    'Forest Shrine',
    '🌲',
    '#22C55E',
    { x: 0.22, y: 0.4 },
    { x: 0.5, y: 0.48 },
    'Trail: go LEFT to the forest shrine!',
    'Quest lock! Hold attention at the shrine!',
    'Forest shrine — calm focused body!',
  ),
  qr(
    'bridge',
    'bridge',
    'River Bridge',
    '🌉',
    '#38BDF8',
    { x: 0.78, y: 0.38 },
    { x: 0.5, y: 0.52 },
    'Trail RIGHT — cross to the river bridge!',
    'Quest lock! Steady focus on the bridge!',
    'Bridge crossed — great attention!',
  ),
  qr(
    'mountain',
    'mountain',
    'Mountain Flag',
    '⛰️',
    '#F97316',
    { x: 0.5, y: 0.22 },
    { x: 0.48, y: 0.5 },
    'Trail UP to the mountain flag!',
    'Quest lock! Hold at the mountain peak!',
    'Mountain flag — tall and focused!',
  ),
  qr(
    'crystal',
    'crystal',
    'Crystal Cave',
    '💎',
    '#A78BFA',
    { x: 0.28, y: 0.64 },
    { x: 0.5, y: 0.46 },
    'Trail down — find the crystal cave!',
    'Quest lock! Hold the crystal glow!',
    'Crystal cave — steady attention!',
  ),
  qr(
    'crown',
    'crown',
    'Crown Altar',
    '👑',
    '#FBBF24',
    { x: 0.72, y: 0.66 },
    { x: 0.5, y: 0.5 },
    'Final trail — reach the CROWN altar!',
    'Quest lock! Hold like a quest champion!',
    'Crown altar — quest hero!',
  ),
];
