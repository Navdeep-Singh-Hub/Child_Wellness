/**
 * OT Level 10 · Session 8 · Game 2 — Open The Path · "Gateway Quest"
 *
 * Emerald + gold path-opening palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const OPEN_SHELL = {
  backText: '#A7F3D0',
  backBorder: 'rgba(167,243,208,0.35)',
  statLabel: '#FDE68A',
  statValue: '#ECFDF5',
  statBorder: 'rgba(253,230,138,0.45)',
  stageBorder: 'rgba(34,197,94,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#22C55E',
  glassBorder: 'rgba(34,197,94,0.35)',
  academyLabel: 'PROBLEM SOLVE LAB',
  find: '#94A3B8',
  open: '#EAB308',
} as const;

export type GateKind = 'forest' | 'cave' | 'garden' | 'river' | 'treasure';

export type OpenThePathRound = {
  id: string;
  gate: GateKind;
  label: string;
  emoji: string;
  color: string;
  find: Point & { radius: number };
  open: Point & { radius: number };
  voiceFind: string;
  voiceOpen: string;
  openCue: string;
};

export const OPEN_THE_PATH_THEME = {
  title: 'Open The Path',
  subtitle: 'Find each closed gateway — then open the path with calm posture, attention and a steady hold!',
  emoji: '🗝️',
  hero: '🚪',
  accent: '#22C55E',
  accentGold: '#EAB308',
  glow: 'rgba(34,197,94,0.5)',
  bgGradient: ['#0F172A', '#14532D', '#713F12', '#1E3A8A'] as [string, string, string, string],
  decor: ['🗝️', '🚪', '🌲', '🪨', '🌸', '🌊', '💎', '🛤️'],
  hintText: 'Find each closed path — then open it with steady body and attention!',
  positionCue: 'Face the camera so we can track your path-opening adventure.',
  findLabel: 'FIND GATE!',
  openLabel: 'OPEN!',
  holdFindLabel: 'GATE FOUND!',
  holdOpenLabel: 'PATH OPEN!',
  voiceIntro:
    'Welcome to Open The Path! Each round you find a closed gateway — then open the path with calm posture and steady attention.',
  voiceComplete: 'Paths opened! You unlocked every gateway like a problem-solving champion!',
  congrats: 'Open The Path Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const op = (
  id: string,
  gate: GateKind,
  label: string,
  emoji: string,
  color: string,
  find: Point,
  open: Point,
  voiceFind: string,
  voiceOpen: string,
  openCue: string,
): OpenThePathRound => ({
  id,
  gate,
  label,
  emoji,
  color,
  find: { ...find, radius: 0.105 },
  open: { ...open, radius: 0.1 },
  voiceFind,
  voiceOpen,
  openCue,
});

export const OPEN_THE_PATH_ROUNDS: OpenThePathRound[] = [
  op(
    'forest',
    'forest',
    'Forest Gate',
    '🌲',
    '#22C55E',
    { x: 0.24, y: 0.4 },
    { x: 0.5, y: 0.48 },
    'FIND LEFT — locate the forest gate!',
    'OPEN hold! Unlock the forest path!',
    'Forest path open — great work!',
  ),
  op(
    'cave',
    'cave',
    'Cave Door',
    '🪨',
    '#78716C',
    { x: 0.76, y: 0.36 },
    { x: 0.5, y: 0.52 },
    'FIND RIGHT — reach the cave door!',
    'OPEN hold! Steady cave path!',
    'Cave opened — clever solve!',
  ),
  op(
    'garden',
    'garden',
    'Garden Wall',
    '🌸',
    '#F472B6',
    { x: 0.5, y: 0.22 },
    { x: 0.48, y: 0.5 },
    'Look UP — find the garden wall gate!',
    'OPEN hold! Garden path ahead!',
    'Garden unlocked — wonderful focus!',
  ),
  op(
    'river',
    'river',
    'River Lock',
    '🌊',
    '#38BDF8',
    { x: 0.3, y: 0.64 },
    { x: 0.5, y: 0.46 },
    'FIND the river lock below!',
    'OPEN hold! River path clear!',
    'River path open — steady body!',
  ),
  op(
    'treasure',
    'treasure',
    'Treasure Path',
    '💎',
    '#EAB308',
    { x: 0.7, y: 0.66 },
    { x: 0.5, y: 0.5 },
    'Final gate — find the treasure path!',
    'OPEN hold! Champion path opener!',
    'Treasure path — quest complete!',
  ),
];
