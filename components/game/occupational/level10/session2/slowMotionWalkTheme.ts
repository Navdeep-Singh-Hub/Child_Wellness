/**
 * OT Level 10 · Session 2 · Game 2 — Slow Motion Walk · "Twilight Slow-Path"
 *
 * Deep twilight indigo + silver moonlight + soft teal — distinct from Cloud Loft.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const TWILIGHT_SHELL = {
  backText: '#E2E8F0',
  backBorder: 'rgba(226,232,240,0.35)',
  statLabel: '#94A3B8',
  statValue: '#F8FAFC',
  statBorder: 'rgba(148,163,184,0.45)',
  stageBorder: 'rgba(45,212,191,0.45)',
  stageBg: 'rgba(15,23,42,0.68)',
  good: '#2DD4BF',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#C4B5FD',
  glassBorder: 'rgba(148,163,184,0.35)',
  academyLabel: 'SLOW MOVEMENT LAB',
  pathGlow: 'rgba(45,212,191,0.35)',
} as const;

export type WalkStoneId = 'start' | 'mist' | 'glow' | 'hush' | 'finish';

export type WalkStone = Point & {
  id: WalkStoneId;
  label: string;
  emoji: string;
  color: string;
  radius: number;
  voiceCue: string;
};

export const SLOW_MOTION_WALK_THEME = {
  title: 'Slow Motion Walk',
  subtitle: 'Glide like slow-motion along the twilight path — move your body gently to each glowing stone!',
  emoji: '🐢',
  hero: '🌙',
  accent: '#2DD4BF',
  accentSilver: '#CBD5E1',
  accentViolet: '#A78BFA',
  glow: 'rgba(45,212,191,0.5)',
  bgGradient: ['#0F172A', '#1E1B4B', '#134E4A', '#312E81'] as [string, string, string, string],
  decor: ['🌙', '✨', '🐢', '🪨', '💫', '🌿', '⭐', '🦶'],
  hintText: 'Move slowly — glide your explorer dot to each stone and hold steady.',
  positionCue: 'Face the camera so we can track your slow, smooth movement.',
  slowLabel: 'SLOW…',
  reachLabel: 'GLIDE…',
  holdLabel: 'HOLD…',
  fastCue: 'Too fast! Move in slow motion…',
  voiceIntro:
    'Welcome to the Twilight Slow-Path! Walk in slow motion from stone to stone. Move gently and hold steady at each glow.',
  voiceComplete: 'Amazing slow walking! You moved with calm, steady regulation!',
  congrats: 'Slow Motion Master!',
  skillTags: [
    'self-regulation',
    'motor-control',
    'sensory-integration',
    'adaptive-responses',
    'functional-participation',
  ],
} as const;

export const WALK_STONES: WalkStone[] = [
  {
    id: 'start',
    label: 'Mist Step',
    emoji: '🌫️',
    color: '#94A3B8',
    x: 0.18,
    y: 0.62,
    radius: 0.105,
    voiceCue: 'Glide slowly to the mist stone on the left!',
  },
  {
    id: 'mist',
    label: 'Glow Step',
    emoji: '✨',
    color: '#2DD4BF',
    x: 0.35,
    y: 0.44,
    radius: 0.1,
    voiceCue: 'Slowly reach the glowing stone!',
  },
  {
    id: 'glow',
    label: 'Hush Step',
    emoji: '🤫',
    color: '#A78BFA',
    x: 0.5,
    y: 0.58,
    radius: 0.095,
    voiceCue: 'Quiet slow steps to the hush stone!',
  },
  {
    id: 'hush',
    label: 'Star Step',
    emoji: '⭐',
    color: '#FDE68A',
    x: 0.66,
    y: 0.4,
    radius: 0.1,
    voiceCue: 'Glide up to the star stone — stay slow!',
  },
  {
    id: 'finish',
    label: 'Moon Finish',
    emoji: '🌙',
    color: '#CBD5E1',
    x: 0.82,
    y: 0.54,
    radius: 0.105,
    voiceCue: 'Last step — slow motion to the moon stone!',
  },
];
