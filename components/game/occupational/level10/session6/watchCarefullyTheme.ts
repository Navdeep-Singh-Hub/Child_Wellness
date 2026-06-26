/**
 * OT Level 10 · Session 6 · Game 4 — Watch Carefully · "Observer Trail"
 *
 * Cyan + sky blue observation palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const WATCH_SHELL = {
  backText: '#A5F3FC',
  backBorder: 'rgba(165,243,252,0.35)',
  statLabel: '#A5B4FC',
  statValue: '#F0F9FF',
  statBorder: 'rgba(165,180,252,0.45)',
  stageBorder: 'rgba(6,182,212,0.55)',
  stageBg: 'rgba(15,23,42,0.86)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#06B6D4',
  glassBorder: 'rgba(6,182,212,0.35)',
  academyLabel: 'ATTENTION LAB',
  watch: '#38BDF8',
  careful: '#22D3EE',
} as const;

export type WatchScene = 'nest' | 'butterfly' | 'stars' | 'door' | 'treasure';

export type WatchCarefullyRound = {
  id: string;
  scene: WatchScene;
  label: string;
  emoji: string;
  color: string;
  watch: Point & { radius: number };
  careful: Point & { radius: number };
  voiceWatch: string;
  voiceCareful: string;
  carefulCue: string;
};

export const WATCH_CAREFULLY_THEME = {
  title: 'Watch Carefully',
  subtitle: 'Move to each watch point — then observe carefully with calm stillness and steady attention!',
  emoji: '👀',
  hero: '🔍',
  accent: '#06B6D4',
  accentSky: '#38BDF8',
  glow: 'rgba(6,182,212,0.5)',
  bgGradient: ['#0F172A', '#0C4A6E', '#164E63', '#1E3A5F'] as [string, string, string, string],
  decor: ['👀', '🔍', '🪺', '🦋', '⭐', '🚪', '💎', '✨'],
  hintText: 'Go to each watch point — then hold careful observation with a still body!',
  positionCue: 'Face the camera so we can track your watch-and-observe movement.',
  watchLabel: 'WATCH!',
  carefulLabel: 'OBSERVE!',
  holdWatchLabel: 'WATCH POINT!',
  holdCarefulLabel: 'CAREFUL HOLD!',
  voiceIntro:
    'Welcome to Watch Carefully! Each round you go to a watch point — then observe with calm stillness, good posture and steady attention.',
  voiceComplete: 'Sharp eyes! You watched every scene carefully like an attention detective!',
  congrats: 'Watch Carefully Star!',
  skillTags: [
    'sustained-attention',
    'self-regulation',
    'sensory-integration',
    'motor-planning',
    'adaptive-responses',
  ],
} as const;

const wr = (
  id: string,
  scene: WatchScene,
  label: string,
  emoji: string,
  color: string,
  watch: Point,
  careful: Point,
  voiceWatch: string,
  voiceCareful: string,
  carefulCue: string,
): WatchCarefullyRound => ({
  id,
  scene,
  label,
  emoji,
  color,
  watch: { ...watch, radius: 0.105 },
  careful: { ...careful, radius: 0.1 },
  voiceWatch,
  voiceCareful,
  carefulCue,
});

export const WATCH_CAREFULLY_ROUNDS: WatchCarefullyRound[] = [
  wr(
    'nest',
    'nest',
    'Bird Nest',
    '🪺',
    '#FBBF24',
    { x: 0.24, y: 0.4 },
    { x: 0.5, y: 0.48 },
    'Watch: go LEFT to the bird nest!',
    'Observe carefully! Hold still and watch!',
    'Nest spotted — calm careful eyes!',
  ),
  wr(
    'butterfly',
    'butterfly',
    'Butterfly Garden',
    '🦋',
    '#A78BFA',
    { x: 0.76, y: 0.38 },
    { x: 0.5, y: 0.52 },
    'Watch RIGHT — find the butterfly garden!',
    'Observe! Hold still and watch the butterflies!',
    'Butterflies watched — steady focus!',
  ),
  wr(
    'stars',
    'stars',
    'Star Chart',
    '⭐',
    '#FDE68A',
    { x: 0.5, y: 0.22 },
    { x: 0.48, y: 0.5 },
    'Watch UP — look at the star chart!',
    'Observe carefully! Hold and watch the stars!',
    'Star chart — careful attention!',
  ),
  wr(
    'door',
    'door',
    'Hidden Door',
    '🚪',
    '#38BDF8',
    { x: 0.28, y: 0.64 },
    { x: 0.5, y: 0.46 },
    'Watch below — find the hidden door!',
    'Observe! Hold still at the hidden door!',
    'Door found — quiet observer!',
  ),
  wr(
    'treasure',
    'treasure',
    'Treasure Lens',
    '💎',
    '#22D3EE',
    { x: 0.72, y: 0.66 },
    { x: 0.5, y: 0.5 },
    'Final watch — go to the treasure lens!',
    'Observe carefully! Hold like a watch champion!',
    'Treasure lens — mission complete!',
  ),
];
