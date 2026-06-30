/**
 * OT Level 10 · Session 10 · Game 1 — Jungle Expedition · "Rainforest Quest"
 *
 * Deep jungle green + amber expedition palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const JUNGLE_SHELL = {
  backText: '#BBF7D0',
  backBorder: 'rgba(187,247,208,0.35)',
  statLabel: '#FDE68A',
  statValue: '#F0FDF4',
  statBorder: 'rgba(253,230,138,0.45)',
  stageBorder: 'rgba(22,163,74,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#4ADE80',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#16A34A',
  glassBorder: 'rgba(22,163,74,0.35)',
  academyLabel: 'SENSORY INTEGRATION LAB',
  scout: '#94A3B8',
  trek: '#F59E0B',
} as const;

export type JungleSite = 'trail' | 'river' | 'canopy' | 'tracks' | 'camp';

export type JungleExpeditionRound = {
  id: string;
  site: JungleSite;
  label: string;
  emoji: string;
  color: string;
  scout: Point & { radius: number };
  trek: Point & { radius: number };
  voiceScout: string;
  voiceTrek: string;
  trekCue: string;
};

export const JUNGLE_EXPEDITION_THEME = {
  title: 'Jungle Expedition',
  subtitle: 'Scout each jungle site — then trek with calm posture, attention and a steady hold!',
  emoji: '🌿',
  hero: '🦜',
  accent: '#16A34A',
  accentAmber: '#F59E0B',
  glow: 'rgba(22,163,74,0.5)',
  bgGradient: ['#0F172A', '#14532D', '#713F12', '#1E3A8A'] as [string, string, string, string],
  decor: ['🌿', '🦜', '🌊', '🐾', '🏕️', '🦋', '⭐', '🌴'],
  hintText: 'Scout each site — then trek with steady body and attention!',
  positionCue: 'Face the camera so we can track your jungle expedition.',
  scoutLabel: 'SCOUT!',
  trekLabel: 'TREK!',
  holdScoutLabel: 'SITE FOUND!',
  holdTrekLabel: 'GREAT TREK!',
  voiceIntro:
    'Welcome to Jungle Expedition! Each round you scout a rainforest site — then trek with calm posture and steady attention.',
  voiceComplete: 'Jungle expedition complete! You trekked every site like a sensory integration champion!',
  congrats: 'Jungle Expedition Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const je = (
  id: string,
  site: JungleSite,
  label: string,
  emoji: string,
  color: string,
  scout: Point,
  trek: Point,
  voiceScout: string,
  voiceTrek: string,
  trekCue: string,
): JungleExpeditionRound => ({
  id,
  site,
  label,
  emoji,
  color,
  scout: { ...scout, radius: 0.105 },
  trek: { ...trek, radius: 0.1 },
  voiceScout,
  voiceTrek,
  trekCue,
});

export const JUNGLE_EXPEDITION_ROUNDS: JungleExpeditionRound[] = [
  je(
    'trail',
    'trail',
    'Jungle Trail',
    '🌿',
    '#22C55E',
    { x: 0.26, y: 0.42 },
    { x: 0.5, y: 0.5 },
    'SCOUT LEFT — find the jungle trail!',
    'TREK hold! Calm trail walking!',
    'Jungle trail — wonderful focus!',
  ),
  je(
    'river',
    'river',
    'River Crossing',
    '🌊',
    '#38BDF8',
    { x: 0.74, y: 0.38 },
    { x: 0.48, y: 0.52 },
    'SCOUT RIGHT — reach the river crossing!',
    'TREK hold! Steady river crossing!',
    'River crossing — smart trekking!',
  ),
  je(
    'canopy',
    'canopy',
    'Canopy Lookout',
    '🦜',
    '#A78BFA',
    { x: 0.5, y: 0.22 },
    { x: 0.5, y: 0.48 },
    'Look UP — scout the canopy lookout!',
    'TREK hold! Calm canopy climb!',
    'Canopy lookout — great adventure!',
  ),
  je(
    'tracks',
    'tracks',
    'Animal Tracks',
    '🐾',
    '#FBBF24',
    { x: 0.3, y: 0.66 },
    { x: 0.5, y: 0.46 },
    'SCOUT the animal tracks below!',
    'TREK hold! Calm tracking walk!',
    'Animal tracks — steady body!',
  ),
  je(
    'camp',
    'camp',
    'Base Camp',
    '⭐',
    '#F59E0B',
    { x: 0.68, y: 0.64 },
    { x: 0.5, y: 0.5 },
    'Final site — scout the base camp!',
    'TREK hold! Champion expedition star!',
    'Base camp reached — expedition complete!',
  ),
];
