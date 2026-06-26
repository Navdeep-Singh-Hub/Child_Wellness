/**
 * OT Level 10 · Session 5 · Game 2 — Home Helper · "Home Helper Quest"
 *
 * Warm amber + sage home palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const HOME_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.35)',
  statLabel: '#86EFAC',
  statValue: '#FFFBEB',
  statBorder: 'rgba(134,239,172,0.45)',
  stageBorder: 'rgba(251,191,36,0.55)',
  stageBg: 'rgba(28,25,23,0.82)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#FBBF24',
  glassBorder: 'rgba(251,191,36,0.35)',
  academyLabel: 'DAILY SKILLS LAB',
  prepare: '#A8A29E',
  ready: '#22C55E',
} as const;

export type HomeChore = 'toys' | 'table' | 'pet' | 'plants' | 'laundry';

export type HomeHelperRound = {
  id: string;
  chore: HomeChore;
  label: string;
  emoji: string;
  color: string;
  prepare: Point & { radius: number };
  ready: Point & { radius: number };
  voicePrepare: string;
  voiceReady: string;
  readyCue: string;
};

export const HOME_HELPER_THEME = {
  title: 'Home Helper',
  subtitle: 'Help around the house — prepare at each chore station, then hold your helper-ready stance!',
  emoji: '🏠',
  hero: '🧹',
  accent: '#FBBF24',
  accentSage: '#84CC16',
  glow: 'rgba(251,191,36,0.5)',
  bgGradient: ['#1C1917', '#78350F', '#365314', '#14532D'] as [string, string, string, string],
  decor: ['🏠', '🧸', '🍽️', '🐾', '🪴', '🧺', '🧹', '⭐'],
  hintText: 'Move to each home chore station — then hold your helper-ready stance with tall posture!',
  positionCue: 'Face the camera so we can track your home helper movement.',
  prepareLabel: 'PREPARE!',
  readyLabel: 'HELPER READY!',
  holdPrepareLabel: 'CHORE!',
  holdReadyLabel: 'DONE HOLD!',
  voiceIntro:
    'Welcome to the Home Helper Quest! Each round you prepare at a home chore station — then hold your helper-ready stance with good posture and attention.',
  voiceComplete: 'Amazing helper work! You finished every home chore like a daily skills champion!',
  congrats: 'Home Helper Star!',
  skillTags: [
    'functional-participation',
    'motor-planning',
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
  ],
} as const;

const hr = (
  id: string,
  chore: HomeChore,
  label: string,
  emoji: string,
  color: string,
  prepare: Point,
  ready: Point,
  voicePrepare: string,
  voiceReady: string,
  readyCue: string,
): HomeHelperRound => ({
  id,
  chore,
  label,
  emoji,
  color,
  prepare: { ...prepare, radius: 0.105 },
  ready: { ...ready, radius: 0.1 },
  voicePrepare,
  voiceReady,
  readyCue,
});

export const HOME_HELPER_ROUNDS: HomeHelperRound[] = [
  hr(
    'toys',
    'toys',
    'Toy Basket',
    '🧸',
    '#F472B6',
    { x: 0.24, y: 0.58 },
    { x: 0.5, y: 0.46 },
    'Prepare: go to the TOY basket on the left!',
    'Helper ready! Stand tall — toys put away!',
    'Tidy toys — great helper!',
  ),
  hr(
    'table',
    'table',
    'Kitchen Table',
    '🍽️',
    '#FBBF24',
    { x: 0.5, y: 0.28 },
    { x: 0.5, y: 0.5 },
    'Prepare: move to the KITCHEN table!',
    'Hold your helper stance — table set!',
    'Table ready — steady and tall!',
  ),
  hr(
    'pet',
    'pet',
    'Pet Bowl',
    '🐾',
    '#38BDF8',
    { x: 0.76, y: 0.44 },
    { x: 0.48, y: 0.52 },
    'Prepare: go RIGHT to the pet bowl!',
    'Helper ready! Hold — pet fed!',
    'Pet cared for — calm body!',
  ),
  hr(
    'plants',
    'plants',
    'Plant Shelf',
    '🪴',
    '#84CC16',
    { x: 0.3, y: 0.24 },
    { x: 0.52, y: 0.48 },
    'Prepare: reach UP to the plant shelf!',
    'Hold helper ready — plants watered!',
    'Plants happy — still and focused!',
  ),
  hr(
    'laundry',
    'laundry',
    'Laundry Bin',
    '🧺',
    '#A78BFA',
    { x: 0.7, y: 0.66 },
    { x: 0.5, y: 0.5 },
    'Final chore — go to the LAUNDRY bin!',
    'Helper ready! Hold — laundry sorted!',
    'Home helper champion — all done!',
  ),
];
