/**
 * OT Level 10 · Session 6 · Game 1 — Focus Finder · "Spotlight Quest"
 *
 * Indigo + violet attention palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const FOCUS_SHELL = {
  backText: '#C4B5FD',
  backBorder: 'rgba(196,181,253,0.35)',
  statLabel: '#A5B4FC',
  statValue: '#F5F3FF',
  statBorder: 'rgba(165,180,252,0.45)',
  stageBorder: 'rgba(139,92,246,0.55)',
  stageBg: 'rgba(15,23,42,0.86)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#8B5CF6',
  glassBorder: 'rgba(167,139,250,0.35)',
  academyLabel: 'ATTENTION LAB',
  seek: '#94A3B8',
  focus: '#6366F1',
} as const;

export type FocusBeacon = 'star' | 'moon' | 'crystal' | 'firefly' | 'crown';

export type FocusFinderRound = {
  id: string;
  beacon: FocusBeacon;
  label: string;
  emoji: string;
  color: string;
  seek: Point & { radius: number };
  focus: Point & { radius: number };
  voiceSeek: string;
  voiceFocus: string;
  focusCue: string;
};

export const FOCUS_FINDER_THEME = {
  title: 'Focus Finder',
  subtitle: 'Find each spotlight beacon — then hold calm focus with steady posture and attention!',
  emoji: '🔍',
  hero: '✨',
  accent: '#8B5CF6',
  accentIndigo: '#6366F1',
  glow: 'rgba(139,92,246,0.5)',
  bgGradient: ['#0F172A', '#312E81', '#4C1D95', '#1E1B4B'] as [string, string, string, string],
  decor: ['🔍', '✨', '⭐', '🌙', '💎', '🪲', '👑', '💫'],
  hintText: 'Move to each spotlight — then hold your focus zone with calm body and attention!',
  positionCue: 'Face the camera so we can track your focus and movement.',
  seekLabel: 'FIND IT!',
  focusLabel: 'FOCUS LOCK!',
  holdSeekLabel: 'SPOTLIGHT!',
  holdFocusLabel: 'FOCUS HOLD!',
  voiceIntro:
    'Welcome to Focus Finder! Each round you seek a hidden spotlight — then lock your focus with calm posture and steady attention.',
  voiceComplete: 'Amazing focus! You found every spotlight like an attention champion!',
  congrats: 'Focus Finder Star!',
  skillTags: [
    'attention-regulation',
    'self-regulation',
    'sensory-integration',
    'motor-planning',
    'adaptive-responses',
  ],
} as const;

const fr = (
  id: string,
  beacon: FocusBeacon,
  label: string,
  emoji: string,
  color: string,
  seek: Point,
  focus: Point,
  voiceSeek: string,
  voiceFocus: string,
  focusCue: string,
): FocusFinderRound => ({
  id,
  beacon,
  label,
  emoji,
  color,
  seek: { ...seek, radius: 0.105 },
  focus: { ...focus, radius: 0.1 },
  voiceSeek,
  voiceFocus,
  focusCue,
});

export const FOCUS_FINDER_ROUNDS: FocusFinderRound[] = [
  fr(
    'star',
    'star',
    'Star Spotlight',
    '⭐',
    '#FBBF24',
    { x: 0.24, y: 0.4 },
    { x: 0.5, y: 0.48 },
    'Find the STAR spotlight on the left!',
    'Focus lock! Hold calm attention on the star!',
    'Star focus — still and steady!',
  ),
  fr(
    'moon',
    'moon',
    'Moon Beam',
    '🌙',
    '#A78BFA',
    { x: 0.76, y: 0.36 },
    { x: 0.5, y: 0.52 },
    'Seek RIGHT — find the MOON beam!',
    'Focus lock! Hold with quiet body!',
    'Moon beam locked — calm focus!',
  ),
  fr(
    'crystal',
    'crystal',
    'Crystal Lens',
    '💎',
    '#38BDF8',
    { x: 0.5, y: 0.22 },
    { x: 0.48, y: 0.5 },
    'Look UP — find the crystal lens!',
    'Focus lock! Steady eyes and posture!',
    'Crystal clear — great focus!',
  ),
  fr(
    'firefly',
    'firefly',
    'Firefly Glow',
    '🪲',
    '#84CC16',
    { x: 0.3, y: 0.64 },
    { x: 0.5, y: 0.46 },
    'Seek the FIREFLY glow below!',
    'Focus lock! Hold the glow steady!',
    'Firefly caught — regulated body!',
  ),
  fr(
    'crown',
    'crown',
    'Crown Focus',
    '👑',
    '#F472B6',
    { x: 0.7, y: 0.66 },
    { x: 0.5, y: 0.5 },
    'Final beacon — find the CROWN spotlight!',
    'Focus lock! Hold like a focus champion!',
    'Crown focus — mission complete!',
  ),
];
