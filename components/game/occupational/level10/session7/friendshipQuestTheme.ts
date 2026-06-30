/**
 * OT Level 10 · Session 7 · Game 4 — Friendship Quest · "Bonding Trail"
 *
 * Soft lavender + mint friendship palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const FRIENDSHIP_SHELL = {
  backText: '#E9D5FF',
  backBorder: 'rgba(233,213,255,0.35)',
  statLabel: '#A7F3D0',
  statValue: '#FAF5FF',
  statBorder: 'rgba(167,243,208,0.45)',
  stageBorder: 'rgba(167,139,250,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#A78BFA',
  glassBorder: 'rgba(167,139,250,0.35)',
  academyLabel: 'SOCIAL SENSORY LAB',
  trail: '#94A3B8',
  bond: '#34D399',
} as const;

export type FriendshipStop = 'playground' | 'lunch' | 'story' | 'adventure' | 'bff';

export type FriendshipQuestRound = {
  id: string;
  stop: FriendshipStop;
  label: string;
  emoji: string;
  color: string;
  trail: Point & { radius: number };
  bond: Point & { radius: number };
  voiceTrail: string;
  voiceBond: string;
  bondCue: string;
};

export const FRIENDSHIP_QUEST_THEME = {
  title: 'Friendship Quest',
  subtitle: 'Follow each friendship trail — then bond with calm posture, attention and a steady friendship hold!',
  emoji: '💫',
  hero: '💜',
  accent: '#A78BFA',
  accentMint: '#34D399',
  glow: 'rgba(167,139,250,0.5)',
  bgGradient: ['#0F172A', '#4C1D95', '#134E4A', '#831843'] as [string, string, string, string],
  decor: ['💫', '💜', '🌈', '⭐', '🎠', '🍎', '📖', '🗺️'],
  hintText: 'Follow each friendship trail — then bond with steady body and attention!',
  positionCue: 'Face the camera so we can track your friendship quest adventure.',
  trailLabel: 'TRAIL!',
  bondLabel: 'BOND!',
  holdTrailLabel: 'FRIEND TRAIL!',
  holdBondLabel: 'BOND HOLD!',
  voiceIntro:
    'Welcome to Friendship Quest! Each round you follow a friendship trail — then bond with calm posture and steady attention.',
  voiceComplete: 'Quest complete! You bonded on every friendship trail like a social sensory champion!',
  congrats: 'Friendship Quest Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const fq = (
  id: string,
  stop: FriendshipStop,
  label: string,
  emoji: string,
  color: string,
  trail: Point,
  bond: Point,
  voiceTrail: string,
  voiceBond: string,
  bondCue: string,
): FriendshipQuestRound => ({
  id,
  stop,
  label,
  emoji,
  color,
  trail: { ...trail, radius: 0.105 },
  bond: { ...bond, radius: 0.1 },
  voiceTrail,
  voiceBond,
  bondCue,
});

export const FRIENDSHIP_QUEST_ROUNDS: FriendshipQuestRound[] = [
  fq(
    'playground',
    'playground',
    'Playground Pal',
    '🎠',
    '#F472B6',
    { x: 0.24, y: 0.4 },
    { x: 0.5, y: 0.48 },
    'Trail LEFT — find your playground pal!',
    'Bond hold! Playground friendship with calm body!',
    'Playground bond — steady and kind!',
  ),
  fq(
    'lunch',
    'lunch',
    'Lunch Buddy',
    '🍎',
    '#FB923C',
    { x: 0.76, y: 0.36 },
    { x: 0.5, y: 0.52 },
    'Trail RIGHT — meet your lunch buddy!',
    'Bond hold! Friendly lunch attention!',
    'Lunch bond — great social calm!',
  ),
  fq(
    'story',
    'story',
    'Story Friend',
    '📖',
    '#38BDF8',
    { x: 0.5, y: 0.22 },
    { x: 0.48, y: 0.5 },
    'Look UP — follow the story friend trail!',
    'Bond hold! Story time with steady focus!',
    'Story bond — wonderful attention!',
  ),
  fq(
    'adventure',
    'adventure',
    'Adventure Ally',
    '🗺️',
    '#FBBF24',
    { x: 0.3, y: 0.64 },
    { x: 0.5, y: 0.46 },
    'Trail to your adventure ally below!',
    'Bond hold! Adventure friendship steady!',
    'Adventure bond — team spirit!',
  ),
  fq(
    'bff',
    'bff',
    'Best Friend',
    '💜',
    '#A78BFA',
    { x: 0.7, y: 0.66 },
    { x: 0.5, y: 0.5 },
    'Final trail — find your best friend!',
    'Bond hold! Champion friendship finish!',
    'Best friend bond — quest complete!',
  ),
];
