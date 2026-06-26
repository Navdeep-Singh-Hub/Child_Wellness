/**
 * OT Level 10 · Session 6 · Game 2 — Stop & Think · "Pause Path"
 *
 * Teal + coral regulation palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const STOP_SHELL = {
  backText: '#99F6E4',
  backBorder: 'rgba(153,246,228,0.35)',
  statLabel: '#A5B4FC',
  statValue: '#F0FDFA',
  statBorder: 'rgba(165,180,252,0.45)',
  stageBorder: 'rgba(20,184,166,0.55)',
  stageBg: 'rgba(15,23,42,0.86)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#14B8A6',
  glassBorder: 'rgba(20,184,166,0.35)',
  academyLabel: 'ATTENTION LAB',
  go: '#22C55E',
  stop: '#EF4444',
} as const;

export type PauseCue = 'redlight' | 'pause' | 'calm' | 'think' | 'wait';

export type StopThinkRound = {
  id: string;
  cue: PauseCue;
  label: string;
  emoji: string;
  color: string;
  go: Point & { radius: number };
  stop: Point & { radius: number };
  voiceGo: string;
  voiceStop: string;
  stopCue: string;
};

export const STOP_THINK_THEME = {
  title: 'Stop & Think',
  subtitle: 'Go to each cue — then STOP, think, and hold calm stillness with steady attention!',
  emoji: '🛑',
  hero: '⏸️',
  accent: '#14B8A6',
  accentCoral: '#F97316',
  glow: 'rgba(20,184,166,0.5)',
  bgGradient: ['#0F172A', '#134E4A', '#7F1D1D', '#1E3A5F'] as [string, string, string, string],
  decor: ['🛑', '⏸️', '✋', '💭', '🧘', '⏳', '💚', '⭐'],
  hintText: 'Move to GO — then STOP and think with a calm, still body!',
  positionCue: 'Face the camera so we can track your stop-and-think movement.',
  goLabel: 'GO!',
  stopLabel: 'STOP & THINK!',
  holdGoLabel: 'GO ZONE!',
  holdStopLabel: 'STILL HOLD!',
  voiceIntro:
    'Welcome to Stop and Think! Each round you go to the cue — then STOP, think, and hold calm stillness with good posture and attention.',
  voiceComplete: 'Wonderful regulation! You mastered every stop-and-think challenge!',
  congrats: 'Stop & Think Star!',
  skillTags: [
    'impulse-control',
    'self-regulation',
    'attention-regulation',
    'sensory-integration',
    'adaptive-responses',
  ],
} as const;

const st = (
  id: string,
  cue: PauseCue,
  label: string,
  emoji: string,
  color: string,
  go: Point,
  stop: Point,
  voiceGo: string,
  voiceStop: string,
  stopCue: string,
): StopThinkRound => ({
  id,
  cue,
  label,
  emoji,
  color,
  go: { ...go, radius: 0.105 },
  stop: { ...stop, radius: 0.1 },
  voiceGo,
  voiceStop,
  stopCue,
});

export const STOP_THINK_ROUNDS: StopThinkRound[] = [
  st(
    'redlight',
    'redlight',
    'Red Light',
    '🛑',
    '#EF4444',
    { x: 0.24, y: 0.42 },
    { x: 0.5, y: 0.48 },
    'GO — move to the RED light zone on the left!',
    'STOP and think! Hold still at the stop zone!',
    'Red light — calm frozen body!',
  ),
  st(
    'pause',
    'pause',
    'Pause Button',
    '⏸️',
    '#14B8A6',
    { x: 0.76, y: 0.4 },
    { x: 0.5, y: 0.52 },
    'GO RIGHT to the pause button!',
    'STOP! Pause and think — hold still!',
    'Paused — steady and quiet!',
  ),
  st(
    'calm',
    'calm',
    'Calm Corner',
    '🧘',
    '#A78BFA',
    { x: 0.5, y: 0.24 },
    { x: 0.48, y: 0.5 },
    'GO UP to the calm corner!',
    'STOP and think — hold your calm pose!',
    'Calm corner — great self-control!',
  ),
  st(
    'think',
    'think',
    'Think Cloud',
    '💭',
    '#38BDF8',
    { x: 0.28, y: 0.64 },
    { x: 0.5, y: 0.46 },
    'GO to the THINK cloud below!',
    'STOP! Think cloud — freeze and focus!',
    'Thinking pause — still body!',
  ),
  st(
    'wait',
    'wait',
    'Wait Sign',
    '✋',
    '#FBBF24',
    { x: 0.72, y: 0.66 },
    { x: 0.5, y: 0.5 },
    'Final cue — GO to the WAIT sign!',
    'STOP and think! Hold like a regulation star!',
    'Wait complete — champion control!',
  ),
];
