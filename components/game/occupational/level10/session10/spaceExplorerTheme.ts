/**
 * OT Level 10 · Session 10 · Game 2 — Space Explorer · "Cosmic Quest"
 *
 * Deep space blue + cyan voyage palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const SPACE_SHELL = {
  backText: '#C4B5FD',
  backBorder: 'rgba(196,181,253,0.35)',
  statLabel: '#67E8F9',
  statValue: '#F5F3FF',
  statBorder: 'rgba(103,232,249,0.45)',
  stageBorder: 'rgba(99,102,241,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#818CF8',
  warn: '#FB7185',
  gold: '#67E8F9',
  sparkleColor: '#6366F1',
  glassBorder: 'rgba(99,102,241,0.35)',
  academyLabel: 'SENSORY INTEGRATION LAB',
  scan: '#94A3B8',
  fly: '#22D3EE',
} as const;

export type SpaceZone = 'launch' | 'orbit' | 'asteroid' | 'moon' | 'gateway';

export type SpaceExplorerRound = {
  id: string;
  zone: SpaceZone;
  label: string;
  emoji: string;
  color: string;
  scan: Point & { radius: number };
  fly: Point & { radius: number };
  voiceScan: string;
  voiceFly: string;
  flyCue: string;
};

export const SPACE_EXPLORER_THEME = {
  title: 'Space Explorer',
  subtitle: 'Scan each cosmic zone — then fly with calm posture, attention and a steady hold!',
  emoji: '🚀',
  hero: '🛸',
  accent: '#6366F1',
  accentCyan: '#22D3EE',
  glow: 'rgba(99,102,241,0.5)',
  bgGradient: ['#0F172A', '#312E81', '#0E7490', '#1E1B4B'] as [string, string, string, string],
  decor: ['🚀', '🛸', '🌙', '⭐', '🛰️', '☄️', '🪐', '✨'],
  hintText: 'Scan each zone — then fly with steady body and attention!',
  positionCue: 'Face the camera so we can track your space expedition.',
  scanLabel: 'SCAN!',
  flyLabel: 'FLY!',
  holdScanLabel: 'ZONE FOUND!',
  holdFlyLabel: 'GREAT FLIGHT!',
  voiceIntro:
    'Welcome to Space Explorer! Each round you scan a cosmic zone — then fly with calm posture and steady attention.',
  voiceComplete: 'Space explorer complete! You flew through every zone like a sensory integration champion!',
  congrats: 'Space Explorer Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const se = (
  id: string,
  zone: SpaceZone,
  label: string,
  emoji: string,
  color: string,
  scan: Point,
  fly: Point,
  voiceScan: string,
  voiceFly: string,
  flyCue: string,
): SpaceExplorerRound => ({
  id,
  zone,
  label,
  emoji,
  color,
  scan: { ...scan, radius: 0.105 },
  fly: { ...fly, radius: 0.1 },
  voiceScan,
  voiceFly,
  flyCue,
});

export const SPACE_EXPLORER_ROUNDS: SpaceExplorerRound[] = [
  se(
    'launch',
    'launch',
    'Launch Pad',
    '🚀',
    '#818CF8',
    { x: 0.26, y: 0.42 },
    { x: 0.5, y: 0.5 },
    'SCAN LEFT — find the launch pad!',
    'FLY hold! Calm liftoff!',
    'Launch pad — wonderful focus!',
  ),
  se(
    'orbit',
    'orbit',
    'Orbit Station',
    '🛰️',
    '#38BDF8',
    { x: 0.74, y: 0.38 },
    { x: 0.48, y: 0.52 },
    'SCAN RIGHT — reach the orbit station!',
    'FLY hold! Steady orbit flight!',
    'Orbit station — smart flying!',
  ),
  se(
    'asteroid',
    'asteroid',
    'Asteroid Field',
    '☄️',
    '#F472B6',
    { x: 0.5, y: 0.22 },
    { x: 0.5, y: 0.48 },
    'Look UP — scan the asteroid field!',
    'FLY hold! Calm asteroid dodge!',
    'Asteroid field — great adventure!',
  ),
  se(
    'moon',
    'moon',
    'Moon Base',
    '🌙',
    '#FBBF24',
    { x: 0.3, y: 0.66 },
    { x: 0.5, y: 0.46 },
    'SCAN the moon base below!',
    'FLY hold! Calm lunar landing!',
    'Moon base — steady body!',
  ),
  se(
    'gateway',
    'gateway',
    'Star Gateway',
    '⭐',
    '#22D3EE',
    { x: 0.68, y: 0.64 },
    { x: 0.5, y: 0.5 },
    'Final zone — scan the star gateway!',
    'FLY hold! Champion explorer star!',
    'Star gateway reached — mission complete!',
  ),
];
