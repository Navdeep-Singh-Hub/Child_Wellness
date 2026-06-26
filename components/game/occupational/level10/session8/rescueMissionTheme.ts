/**
 * OT Level 10 · Session 8 · Game 4 — Rescue Mission · "Hero Quest"
 *
 * Crimson + sky-blue rescue palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const RESCUE_SHELL = {
  backText: '#FECDD3',
  backBorder: 'rgba(254,205,211,0.35)',
  statLabel: '#7DD3FC',
  statValue: '#FFF1F2',
  statBorder: 'rgba(125,211,252,0.45)',
  stageBorder: 'rgba(239,68,68,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#F87171',
  warn: '#FB7185',
  gold: '#7DD3FC',
  sparkleColor: '#EF4444',
  glassBorder: 'rgba(239,68,68,0.35)',
  academyLabel: 'PROBLEM SOLVE LAB',
  spot: '#94A3B8',
  rescue: '#38BDF8',
} as const;

export type SignalKind = 'forest' | 'cave' | 'river' | 'mountain' | 'final';

export type RescueMissionRound = {
  id: string;
  signal: SignalKind;
  label: string;
  emoji: string;
  color: string;
  spot: Point & { radius: number };
  rescue: Point & { radius: number };
  voiceSpot: string;
  voiceRescue: string;
  rescueCue: string;
};

export const RESCUE_MISSION_THEME = {
  title: 'Rescue Mission',
  subtitle: 'Spot each rescue signal — then complete the rescue with calm posture, attention and a steady hold!',
  emoji: '🦸',
  hero: '🚁',
  accent: '#EF4444',
  accentSky: '#38BDF8',
  glow: 'rgba(239,68,68,0.5)',
  bgGradient: ['#0F172A', '#7F1D1D', '#0C4A6E', '#1E1B4B'] as [string, string, string, string],
  decor: ['🦸', '🚁', '🆘', '🌲', '🪨', '🌊', '⛰️', '⭐'],
  hintText: 'Spot the rescue signal — then complete the mission with steady body and attention!',
  positionCue: 'Face the camera so we can track your rescue mission.',
  spotLabel: 'SPOT SIGNAL!',
  rescueLabel: 'RESCUE!',
  holdSpotLabel: 'SIGNAL FOUND!',
  holdRescueLabel: 'MISSION DONE!',
  voiceIntro:
    'Welcome to Rescue Mission! Each round you spot a rescue signal — then complete the rescue with calm posture and steady attention.',
  voiceComplete: 'Missions complete! You rescued every signal like a problem-solving champion!',
  congrats: 'Rescue Mission Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const rm = (
  id: string,
  signal: SignalKind,
  label: string,
  emoji: string,
  color: string,
  spot: Point,
  rescue: Point,
  voiceSpot: string,
  voiceRescue: string,
  rescueCue: string,
): RescueMissionRound => ({
  id,
  signal,
  label,
  emoji,
  color,
  spot: { ...spot, radius: 0.105 },
  rescue: { ...rescue, radius: 0.1 },
  voiceSpot,
  voiceRescue,
  rescueCue,
});

export const RESCUE_MISSION_ROUNDS: RescueMissionRound[] = [
  rm(
    'forest',
    'forest',
    'Forest Call',
    '🌲',
    '#22C55E',
    { x: 0.25, y: 0.4 },
    { x: 0.5, y: 0.5 },
    'SPOT LEFT — find the forest rescue signal!',
    'RESCUE hold! Complete the forest mission!',
    'Forest rescued — brave spotter!',
  ),
  rm(
    'cave',
    'cave',
    'Cave SOS',
    '🪨',
    '#78716C',
    { x: 0.75, y: 0.35 },
    { x: 0.48, y: 0.52 },
    'SPOT RIGHT — locate the cave SOS!',
    'RESCUE hold! Steady cave mission!',
    'Cave rescue done — great focus!',
  ),
  rm(
    'river',
    'river',
    'River Alert',
    '🌊',
    '#38BDF8',
    { x: 0.5, y: 0.22 },
    { x: 0.5, y: 0.48 },
    'Look UP — spot the river alert!',
    'RESCUE hold! River mission ahead!',
    'River rescued — wonderful solve!',
  ),
  rm(
    'mountain',
    'mountain',
    'Mountain Signal',
    '⛰️',
    '#A78BFA',
    { x: 0.3, y: 0.65 },
    { x: 0.5, y: 0.46 },
    'SPOT the mountain signal below!',
    'RESCUE hold! Mountain mission clear!',
    'Mountain signal saved — steady body!',
  ),
  rm(
    'final',
    'final',
    'Final Rescue',
    '⭐',
    '#FBBF24',
    { x: 0.7, y: 0.64 },
    { x: 0.5, y: 0.5 },
    'Final signal — spot the last rescue!',
    'RESCUE hold! Champion hero mission!',
    'Final rescue — quest complete!',
  ),
];
