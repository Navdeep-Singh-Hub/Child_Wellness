/**
 * OT Level 10 · Session 9 · Game 4 — Travel Challenge · "Journey Quest"
 *
 * Sky blue + sunset travel palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const TRAVEL_SHELL = {
  backText: '#BAE6FD',
  backBorder: 'rgba(186,230,253,0.35)',
  statLabel: '#FDBA74',
  statValue: '#F0F9FF',
  statBorder: 'rgba(253,186,116,0.45)',
  stageBorder: 'rgba(14,165,233,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#38BDF8',
  warn: '#FB7185',
  gold: '#FDBA74',
  sparkleColor: '#0EA5E9',
  glassBorder: 'rgba(14,165,233,0.35)',
  academyLabel: 'REAL-LIFE LAB',
  pack: '#94A3B8',
  travel: '#F97316',
} as const;

export type TravelStop = 'suitcase' | 'airport' | 'train' | 'bus' | 'destination';

export type TravelChallengeRound = {
  id: string;
  stop: TravelStop;
  label: string;
  emoji: string;
  color: string;
  pack: Point & { radius: number };
  travel: Point & { radius: number };
  voicePack: string;
  voiceTravel: string;
  travelCue: string;
};

export const TRAVEL_CHALLENGE_THEME = {
  title: 'Travel Challenge',
  subtitle: 'Pack for each travel stop — then journey with calm posture, attention and a steady hold!',
  emoji: '✈️',
  hero: '🧳',
  accent: '#0EA5E9',
  accentSunset: '#F97316',
  glow: 'rgba(14,165,233,0.5)',
  bgGradient: ['#0F172A', '#0C4A6E', '#7C2D12', '#1E3A8A'] as [string, string, string, string],
  decor: ['✈️', '🧳', '🚂', '🚌', '🗺️', '🌅', '⭐', '🏨'],
  hintText: 'Pack at each stop — then travel with steady body and attention!',
  positionCue: 'Face the camera so we can track your travel adventure.',
  packLabel: 'PACK!',
  travelLabel: 'TRAVEL!',
  holdPackLabel: 'PACKED!',
  holdTravelLabel: 'GREAT JOURNEY!',
  voiceIntro:
    'Welcome to Travel Challenge! Each round you pack for a travel stop — then journey with calm posture and steady attention.',
  voiceComplete: 'Travel challenge complete! You finished every stop like a real-life sensory champion!',
  congrats: 'Travel Challenge Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const tc = (
  id: string,
  stop: TravelStop,
  label: string,
  emoji: string,
  color: string,
  pack: Point,
  travel: Point,
  voicePack: string,
  voiceTravel: string,
  travelCue: string,
): TravelChallengeRound => ({
  id,
  stop,
  label,
  emoji,
  color,
  pack: { ...pack, radius: 0.105 },
  travel: { ...travel, radius: 0.1 },
  voicePack,
  voiceTravel,
  travelCue,
});

export const TRAVEL_CHALLENGE_ROUNDS: TravelChallengeRound[] = [
  tc(
    'suitcase',
    'suitcase',
    'Suitcase',
    '🧳',
    '#38BDF8',
    { x: 0.28, y: 0.42 },
    { x: 0.5, y: 0.5 },
    'PACK LEFT — gather your suitcase!',
    'TRAVEL hold! Calm departure!',
    'Suitcase packed — ready to go!',
  ),
  tc(
    'airport',
    'airport',
    'Airport Gate',
    '✈️',
    '#0EA5E9',
    { x: 0.72, y: 0.38 },
    { x: 0.48, y: 0.52 },
    'PACK RIGHT — reach the airport gate!',
    'TRAVEL hold! Steady boarding!',
    'Airport gate — wonderful focus!',
  ),
  tc(
    'train',
    'train',
    'Train Platform',
    '🚂',
    '#A78BFA',
    { x: 0.5, y: 0.24 },
    { x: 0.5, y: 0.48 },
    'Look UP — pack at the train platform!',
    'TRAVEL hold! Calm train ride!',
    'Train platform — smart travel!',
  ),
  tc(
    'bus',
    'bus',
    'Bus Stop',
    '🚌',
    '#FBBF24',
    { x: 0.32, y: 0.66 },
    { x: 0.5, y: 0.46 },
    'PACK at the bus stop below!',
    'TRAVEL hold! Calm bus journey!',
    'Bus stop calm — steady body!',
  ),
  tc(
    'destination',
    'destination',
    'Destination',
    '⭐',
    '#F97316',
    { x: 0.68, y: 0.64 },
    { x: 0.5, y: 0.5 },
    'Final stop — pack for your destination!',
    'TRAVEL hold! Champion journey star!',
    'Destination reached — challenge complete!',
  ),
];
