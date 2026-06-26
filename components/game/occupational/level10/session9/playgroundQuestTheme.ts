/**
 * OT Level 10 · Session 9 · Game 3 — Playground Quest · "Park Adventure"
 *
 * Lime + sunny yellow playground palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const PLAY_SHELL = {
  backText: '#BBF7D0',
  backBorder: 'rgba(187,247,208,0.35)',
  statLabel: '#FDE68A',
  statValue: '#F0FDF4',
  statBorder: 'rgba(253,230,138,0.45)',
  stageBorder: 'rgba(34,197,94,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#4ADE80',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#22C55E',
  glassBorder: 'rgba(34,197,94,0.35)',
  academyLabel: 'REAL-LIFE LAB',
  explore: '#94A3B8',
  play: '#EAB308',
} as const;

export type PlaySpot = 'swings' | 'slide' | 'climb' | 'sandbox' | 'finish';

export type PlaygroundQuestRound = {
  id: string;
  spot: PlaySpot;
  label: string;
  emoji: string;
  color: string;
  explore: Point & { radius: number };
  play: Point & { radius: number };
  voiceExplore: string;
  voicePlay: string;
  playCue: string;
};

export const PLAYGROUND_QUEST_THEME = {
  title: 'Playground Quest',
  subtitle: 'Explore each playground station — then play with calm posture, attention and a steady hold!',
  emoji: '🛝',
  hero: '⚽',
  accent: '#22C55E',
  accentSun: '#EAB308',
  glow: 'rgba(34,197,94,0.5)',
  bgGradient: ['#0F172A', '#14532D', '#713F12', '#1E3A8A'] as [string, string, string, string],
  decor: ['🛝', '⚽', '🎠', '🏃', '🌳', '⭐', '🎈', '☀️'],
  hintText: 'Explore each station — then play with steady body and attention!',
  positionCue: 'Face the camera so we can track your playground adventure.',
  exploreLabel: 'EXPLORE!',
  playLabel: 'PLAY!',
  holdExploreLabel: 'STATION FOUND!',
  holdPlayLabel: 'GREAT PLAY!',
  voiceIntro:
    'Welcome to Playground Quest! Each round you explore a playground station — then play with calm posture and steady attention.',
  voiceComplete: 'Playground quest complete! You played at every station like a real-life sensory champion!',
  congrats: 'Playground Quest Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const pq = (
  id: string,
  spot: PlaySpot,
  label: string,
  emoji: string,
  color: string,
  explore: Point,
  play: Point,
  voiceExplore: string,
  voicePlay: string,
  playCue: string,
): PlaygroundQuestRound => ({
  id,
  spot,
  label,
  emoji,
  color,
  explore: { ...explore, radius: 0.105 },
  play: { ...play, radius: 0.1 },
  voiceExplore,
  voicePlay,
  playCue,
});

export const PLAYGROUND_QUEST_ROUNDS: PlaygroundQuestRound[] = [
  pq(
    'swings',
    'swings',
    'Swings',
    '🎠',
    '#38BDF8',
    { x: 0.25, y: 0.4 },
    { x: 0.5, y: 0.5 },
    'EXPLORE LEFT — find the swings!',
    'PLAY hold! Calm swing time!',
    'Swings — great playground play!',
  ),
  pq(
    'slide',
    'slide',
    'Big Slide',
    '🛝',
    '#22C55E',
    { x: 0.75, y: 0.36 },
    { x: 0.48, y: 0.52 },
    'EXPLORE RIGHT — reach the big slide!',
    'PLAY hold! Steady slide fun!',
    'Slide done — wonderful focus!',
  ),
  pq(
    'climb',
    'climb',
    'Climbing Frame',
    '🧗',
    '#F97316',
    { x: 0.5, y: 0.22 },
    { x: 0.5, y: 0.48 },
    'Look UP — explore the climbing frame!',
    'PLAY hold! Climb with calm body!',
    'Climbing frame — smart play!',
  ),
  pq(
    'sandbox',
    'sandbox',
    'Sandbox',
    '🏖️',
    '#FBBF24',
    { x: 0.3, y: 0.65 },
    { x: 0.5, y: 0.46 },
    'EXPLORE the sandbox below!',
    'PLAY hold! Calm sandbox fun!',
    'Sandbox calm — steady body!',
  ),
  pq(
    'finish',
    'finish',
    'Finish Line',
    '⭐',
    '#A78BFA',
    { x: 0.7, y: 0.64 },
    { x: 0.5, y: 0.5 },
    'Final station — explore the finish line!',
    'PLAY hold! Champion playground star!',
    'Finish line — quest complete!',
  ),
];
