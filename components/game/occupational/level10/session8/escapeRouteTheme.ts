/**
 * OT Level 10 · Session 8 · Game 3 — Escape Route · "Exit Quest"
 *
 * Violet + coral escape-route palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const ESCAPE_SHELL = {
  backText: '#DDD6FE',
  backBorder: 'rgba(221,214,254,0.35)',
  statLabel: '#FDBA74',
  statValue: '#F5F3FF',
  statBorder: 'rgba(253,186,116,0.45)',
  stageBorder: 'rgba(139,92,246,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#A78BFA',
  warn: '#FB7185',
  gold: '#FDBA74',
  sparkleColor: '#8B5CF6',
  glassBorder: 'rgba(139,92,246,0.35)',
  academyLabel: 'PROBLEM SOLVE LAB',
  scout: '#94A3B8',
  escape: '#F97316',
} as const;

export type ExitKind = 'maze' | 'tunnel' | 'bridge' | 'forest' | 'final';

export type EscapeRouteRound = {
  id: string;
  exit: ExitKind;
  label: string;
  emoji: string;
  color: string;
  scout: Point & { radius: number };
  escape: Point & { radius: number };
  voiceScout: string;
  voiceEscape: string;
  escapeCue: string;
};

export const ESCAPE_ROUTE_THEME = {
  title: 'Escape Route',
  subtitle: 'Scout each blocked exit — then follow the escape route with calm posture, attention and a steady hold!',
  emoji: '🏃',
  hero: '🚪',
  accent: '#8B5CF6',
  accentCoral: '#F97316',
  glow: 'rgba(139,92,246,0.5)',
  bgGradient: ['#0F172A', '#4C1D95', '#7C2D12', '#1E1B4B'] as [string, string, string, string],
  decor: ['🏃', '🚪', '🧭', '🕳️', '🌉', '🌲', '⛳', '✨'],
  hintText: 'Scout the escape opening — then follow the route with steady body and attention!',
  positionCue: 'Face the camera so we can track your escape adventure.',
  scoutLabel: 'SCOUT EXIT!',
  escapeLabel: 'ESCAPE!',
  holdScoutLabel: 'EXIT FOUND!',
  holdEscapeLabel: 'ROUTE CLEAR!',
  voiceIntro:
    'Welcome to Escape Route! Each round you scout a blocked exit — then follow the escape route with calm posture and steady attention.',
  voiceComplete: 'Routes escaped! You solved every exit like a problem-solving champion!',
  congrats: 'Escape Route Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const er = (
  id: string,
  exit: ExitKind,
  label: string,
  emoji: string,
  color: string,
  scout: Point,
  escape: Point,
  voiceScout: string,
  voiceEscape: string,
  escapeCue: string,
): EscapeRouteRound => ({
  id,
  exit,
  label,
  emoji,
  color,
  scout: { ...scout, radius: 0.105 },
  escape: { ...escape, radius: 0.1 },
  voiceScout,
  voiceEscape,
  escapeCue,
});

export const ESCAPE_ROUTE_ROUNDS: EscapeRouteRound[] = [
  er(
    'maze',
    'maze',
    'Maze Exit',
    '🧩',
    '#A78BFA',
    { x: 0.26, y: 0.38 },
    { x: 0.52, y: 0.5 },
    'SCOUT LEFT — find the maze exit!',
    'ESCAPE hold! Follow the maze route!',
    'Maze escaped — clever scout!',
  ),
  er(
    'tunnel',
    'tunnel',
    'Tunnel Dash',
    '🕳️',
    '#78716C',
    { x: 0.74, y: 0.34 },
    { x: 0.48, y: 0.54 },
    'SCOUT RIGHT — spot the tunnel exit!',
    'ESCAPE hold! Steady tunnel route!',
    'Tunnel clear — great focus!',
  ),
  er(
    'bridge',
    'bridge',
    'Bridge Escape',
    '🌉',
    '#38BDF8',
    { x: 0.5, y: 0.2 },
    { x: 0.5, y: 0.48 },
    'Look UP — scout the bridge exit!',
    'ESCAPE hold! Cross the bridge route!',
    'Bridge escaped — wonderful solve!',
  ),
  er(
    'forest',
    'forest',
    'Forest Run',
    '🌲',
    '#22C55E',
    { x: 0.28, y: 0.66 },
    { x: 0.5, y: 0.44 },
    'SCOUT the forest trail below!',
    'ESCAPE hold! Forest route ahead!',
    'Forest route clear — steady body!',
  ),
  er(
    'final',
    'final',
    'Final Exit',
    '⛳',
    '#F97316',
    { x: 0.72, y: 0.64 },
    { x: 0.5, y: 0.5 },
    'Final exit — scout the last route!',
    'ESCAPE hold! Champion route finder!',
    'Final exit — quest complete!',
  ),
];
