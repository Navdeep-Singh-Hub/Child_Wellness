/**
 * OT Level 10 · Session 10 · Game 4 — Mountain Rescue · "Alpine Quest"
 *
 * Slate gray + alpine cyan rescue palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const MOUNTAIN_SHELL = {
  backText: '#E0F2FE',
  backBorder: 'rgba(224,242,254,0.35)',
  statLabel: '#CBD5E1',
  statValue: '#F8FAFC',
  statBorder: 'rgba(203,213,225,0.45)',
  stageBorder: 'rgba(14,165,233,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#38BDF8',
  warn: '#FB7185',
  gold: '#E0F2FE',
  sparkleColor: '#0EA5E9',
  glassBorder: 'rgba(14,165,233,0.35)',
  academyLabel: 'SENSORY INTEGRATION LAB',
  spot: '#94A3B8',
  rescue: '#22C55E',
} as const;

export type MountainSite = 'basecamp' | 'trail' | 'ridge' | 'beacon' | 'summit';

export type MountainRescueRound = {
  id: string;
  site: MountainSite;
  label: string;
  emoji: string;
  color: string;
  spot: Point & { radius: number };
  rescue: Point & { radius: number };
  voiceSpot: string;
  voiceRescue: string;
  rescueCue: string;
};

export const MOUNTAIN_RESCUE_THEME = {
  title: 'Mountain Rescue',
  subtitle: 'Spot each rescue site — then climb with calm posture, attention and a steady hold!',
  emoji: '🏔️',
  hero: '🆘',
  accent: '#0EA5E9',
  accentGreen: '#22C55E',
  glow: 'rgba(14,165,233,0.5)',
  bgGradient: ['#0F172A', '#1E3A8A', '#334155', '#0C4A6E'] as [string, string, string, string],
  decor: ['🏔️', '⛺', '🪨', '🆘', '❄️', '🧗', '⭐', '🌨️'],
  hintText: 'Spot each site — then rescue with steady body and attention!',
  positionCue: 'Face the camera so we can track your mountain rescue.',
  spotLabel: 'SPOT!',
  rescueLabel: 'RESCUE!',
  holdSpotLabel: 'SITE SPOTTED!',
  holdRescueLabel: 'RESCUE COMPLETE!',
  voiceIntro:
    'Welcome to Mountain Rescue! Each round you spot a rescue site — then climb with calm posture and steady attention.',
  voiceComplete: 'Mountain rescue complete! You reached every site like a sensory integration champion!',
  congrats: 'Mountain Rescue Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const mr = (
  id: string,
  site: MountainSite,
  label: string,
  emoji: string,
  color: string,
  spot: Point,
  rescue: Point,
  voiceSpot: string,
  voiceRescue: string,
  rescueCue: string,
): MountainRescueRound => ({
  id,
  site,
  label,
  emoji,
  color,
  spot: { ...spot, radius: 0.105 },
  rescue: { ...rescue, radius: 0.1 },
  voiceSpot,
  voiceRescue,
  rescueCue,
});

export const MOUNTAIN_RESCUE_ROUNDS: MountainRescueRound[] = [
  mr(
    'basecamp',
    'basecamp',
    'Base Camp',
    '⛺',
    '#38BDF8',
    { x: 0.26, y: 0.42 },
    { x: 0.5, y: 0.5 },
    'SPOT LEFT — find the base camp!',
    'RESCUE hold! Calm camp climb!',
    'Base camp — wonderful focus!',
  ),
  mr(
    'trail',
    'trail',
    'Rocky Trail',
    '🪨',
    '#94A3B8',
    { x: 0.74, y: 0.38 },
    { x: 0.48, y: 0.52 },
    'SPOT RIGHT — reach the rocky trail!',
    'RESCUE hold! Steady trail climb!',
    'Rocky trail — smart rescue!',
  ),
  mr(
    'ridge',
    'ridge',
    'Cliff Ridge',
    '🏔️',
    '#A78BFA',
    { x: 0.5, y: 0.22 },
    { x: 0.5, y: 0.48 },
    'Look UP — spot the cliff ridge!',
    'RESCUE hold! Calm ridge climb!',
    'Cliff ridge — great adventure!',
  ),
  mr(
    'beacon',
    'beacon',
    'Rescue Beacon',
    '🆘',
    '#FBBF24',
    { x: 0.3, y: 0.66 },
    { x: 0.5, y: 0.46 },
    'SPOT the rescue beacon below!',
    'RESCUE hold! Calm beacon reach!',
    'Rescue beacon — steady body!',
  ),
  mr(
    'summit',
    'summit',
    'Summit Safe',
    '⭐',
    '#22C55E',
    { x: 0.68, y: 0.64 },
    { x: 0.5, y: 0.5 },
    'Final site — spot the summit safe zone!',
    'RESCUE hold! Champion mountain star!',
    'Summit safe — rescue complete!',
  ),
];
