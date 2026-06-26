/**
 * OT Level 10 · Session 10 · Game 3 — Pirate Treasure Hunt · "Captain's Quest"
 *
 * Ocean teal + treasure gold pirate palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const PIRATE_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.35)',
  statLabel: '#5EEAD4',
  statValue: '#FFFBEB',
  statBorder: 'rgba(94,234,212,0.45)',
  stageBorder: 'rgba(217,119,6,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#FBBF24',
  warn: '#FB7185',
  gold: '#5EEAD4',
  sparkleColor: '#D97706',
  glassBorder: 'rgba(217,119,6,0.35)',
  academyLabel: 'SENSORY INTEGRATION LAB',
  seek: '#94A3B8',
  claim: '#F59E0B',
} as const;

export type PirateStop = 'map' | 'cove' | 'ship' | 'chest' | 'prize';

export type PirateTreasureHuntRound = {
  id: string;
  stop: PirateStop;
  label: string;
  emoji: string;
  color: string;
  seek: Point & { radius: number };
  claim: Point & { radius: number };
  voiceSeek: string;
  voiceClaim: string;
  claimCue: string;
};

export const PIRATE_TREASURE_HUNT_THEME = {
  title: 'Pirate Treasure Hunt',
  subtitle: 'Seek each treasure spot — then claim with calm posture, attention and a steady hold!',
  emoji: '🏴‍☠️',
  hero: '💰',
  accent: '#D97706',
  accentTeal: '#0D9488',
  glow: 'rgba(217,119,6,0.5)',
  bgGradient: ['#0F172A', '#78350F', '#134E4A', '#1E3A8A'] as [string, string, string, string],
  decor: ['🏴‍☠️', '🗺️', '⚓', '💰', '🏝️', '🦜', '⭐', '🌊'],
  hintText: 'Seek each spot — then claim treasure with steady body and attention!',
  positionCue: 'Face the camera so we can track your pirate adventure.',
  seekLabel: 'SEEK!',
  claimLabel: 'CLAIM!',
  holdSeekLabel: 'SPOT FOUND!',
  holdClaimLabel: 'TREASURE CLAIMED!',
  voiceIntro:
    'Welcome to Pirate Treasure Hunt! Each round you seek a treasure spot — then claim it with calm posture and steady attention.',
  voiceComplete: 'Treasure hunt complete! You claimed every spot like a sensory integration champion!',
  congrats: 'Pirate Treasure Hunt Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const pt = (
  id: string,
  stop: PirateStop,
  label: string,
  emoji: string,
  color: string,
  seek: Point,
  claim: Point,
  voiceSeek: string,
  voiceClaim: string,
  claimCue: string,
): PirateTreasureHuntRound => ({
  id,
  stop,
  label,
  emoji,
  color,
  seek: { ...seek, radius: 0.105 },
  claim: { ...claim, radius: 0.1 },
  voiceSeek,
  voiceClaim,
  claimCue,
});

export const PIRATE_TREASURE_HUNT_ROUNDS: PirateTreasureHuntRound[] = [
  pt(
    'map',
    'map',
    'Treasure Map',
    '🗺️',
    '#38BDF8',
    { x: 0.26, y: 0.42 },
    { x: 0.5, y: 0.5 },
    'SEEK LEFT — find the treasure map!',
    'CLAIM hold! Calm map reading!',
    'Treasure map — wonderful focus!',
  ),
  pt(
    'cove',
    'cove',
    'Hidden Cove',
    '🏝️',
    '#14B8A6',
    { x: 0.74, y: 0.38 },
    { x: 0.48, y: 0.52 },
    'SEEK RIGHT — reach the hidden cove!',
    'CLAIM hold! Steady cove landing!',
    'Hidden cove — smart treasure seek!',
  ),
  pt(
    'ship',
    'ship',
    'Pirate Ship',
    '⚓',
    '#A78BFA',
    { x: 0.5, y: 0.22 },
    { x: 0.5, y: 0.48 },
    'Look UP — seek the pirate ship!',
    'CLAIM hold! Calm deck balance!',
    'Pirate ship — great adventure!',
  ),
  pt(
    'chest',
    'chest',
    'Treasure Chest',
    '💰',
    '#FBBF24',
    { x: 0.3, y: 0.66 },
    { x: 0.5, y: 0.46 },
    'SEEK the treasure chest below!',
    'CLAIM hold! Calm treasure grab!',
    'Treasure chest — steady body!',
  ),
  pt(
    'prize',
    'prize',
    "Captain's Prize",
    '⭐',
    '#F59E0B',
    { x: 0.68, y: 0.64 },
    { x: 0.5, y: 0.5 },
    "Final spot — seek the captain's prize!",
    'CLAIM hold! Champion pirate star!',
    "Captain's prize — hunt complete!",
  ),
];
