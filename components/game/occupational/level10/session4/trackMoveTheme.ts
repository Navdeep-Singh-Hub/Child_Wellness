/**
 * OT Level 10 · Session 4 · Game 2 — Track & Move · "Aurora Motion Trail"
 *
 * Cyan aurora + magenta pulse trail palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const TRACK_SHELL = {
  backText: '#A5F3FC',
  backBorder: 'rgba(165,243,252,0.35)',
  statLabel: '#F0ABFC',
  statValue: '#F0F9FF',
  statBorder: 'rgba(240,171,252,0.45)',
  stageBorder: 'rgba(34,211,238,0.55)',
  stageBg: 'rgba(15,23,42,0.8)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#22D3EE',
  glassBorder: 'rgba(34,211,238,0.35)',
  academyLabel: 'MOTION TRAIL LAB',
  guide: '#22D3EE',
  finish: '#E879F9',
} as const;

export type TrailPath = 'horizontal' | 'vertical' | 'diagonal' | 'arc';

export type TrackMoveRound = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  path: TrailPath;
  start: Point;
  end: Point;
  trackRadius: number;
  finishRadius: number;
  voiceTrack: string;
  voiceMove: string;
  moveCue: string;
};

export const TRACK_MOVE_THEME = {
  title: 'Track & Move',
  subtitle: 'Follow the aurora pulse as it glides — then move your body to the finish glow and hold!',
  emoji: '🎯',
  hero: '💫',
  accent: '#22D3EE',
  accentMagenta: '#E879F9',
  glow: 'rgba(34,211,238,0.5)',
  bgGradient: ['#0F172A', '#083344', '#4A044E', '#0E7490'] as [string, string, string, string],
  decor: ['🎯', '💫', '🌠', '✨', '🔮', '⚡', '🌀', '🛤️'],
  hintText: 'Track the moving pulse with your body — when it stops, move to the finish and hold!',
  positionCue: 'Face the camera so we can track your movement trail.',
  trackLabel: 'TRACK!',
  moveLabel: 'MOVE!',
  holdLabel: 'HOLD FINISH!',
  voiceIntro:
    'Welcome to the Aurora Motion Trail! Each round a pulse glides along a path — track it with your body. When it stops, move to the finish glow and hold steady.',
  voiceComplete: 'Incredible tracking! You followed every aurora trail and moved like a sensory-motor star!',
  congrats: 'Trail Tracker!',
  skillTags: [
    'sensory-integration',
    'motor-planning',
    'attention',
    'adaptive-responses',
    'functional-participation',
  ],
} as const;

const round = (
  id: string,
  label: string,
  emoji: string,
  color: string,
  path: TrailPath,
  start: Point,
  end: Point,
  voiceTrack: string,
  voiceMove: string,
  moveCue: string,
): TrackMoveRound => ({
  id,
  label,
  emoji,
  color,
  path,
  start,
  end,
  trackRadius: 0.12,
  finishRadius: 0.105,
  voiceTrack,
  voiceMove,
  moveCue,
});

export const TRACK_MOVE_ROUNDS: TrackMoveRound[] = [
  round(
    'left-right',
    'Sky Lane',
    '🌠',
    '#22D3EE',
    'horizontal',
    { x: 0.18, y: 0.48 },
    { x: 0.82, y: 0.48 },
    'Track the pulse gliding RIGHT across Sky Lane!',
    'Pulse stopped! MOVE right to the finish glow!',
    'Glide right — lock on the finish!',
  ),
  round(
    'up-down',
    'Falls Path',
    '💧',
    '#38BDF8',
    'vertical',
    { x: 0.5, y: 0.22 },
    { x: 0.5, y: 0.74 },
    'Track the pulse moving DOWN Falls Path!',
    'Now MOVE down to the finish zone!',
    'Lower your body to the finish!',
  ),
  round(
    'diag-ne',
    'Star Diagonal',
    '✨',
    '#E879F9',
    'diagonal',
    { x: 0.22, y: 0.68 },
    { x: 0.78, y: 0.28 },
    'Track the pulse rising diagonally to the star!',
    'MOVE up-right to the finish star!',
    'Diagonal move — reach the glow!',
  ),
  round(
    'right-left',
    'Comet Reverse',
    '☄️',
    '#F472B6',
    'horizontal',
    { x: 0.8, y: 0.42 },
    { x: 0.2, y: 0.56 },
    'Track the comet gliding LEFT!',
    'MOVE left to catch the finish comet!',
    'Sweep left — hold at finish!',
  ),
  round(
    'diag-sw',
    'Aurora Arc',
    '🌈',
    '#A78BFA',
    'arc',
    { x: 0.72, y: 0.26 },
    { x: 0.28, y: 0.72 },
    'Track the aurora arc curving down-left!',
    'MOVE to the rainbow finish and hold!',
    'Follow the arc — finish strong!',
  ),
];
