/**
 * OT Level 10 · Session 7 · Game 1 — Greeting Game · "Friendly Hello Trail"
 *
 * Warm coral + peach social sensory palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const GREETING_SHELL = {
  backText: '#FED7AA',
  backBorder: 'rgba(254,215,170,0.35)',
  statLabel: '#FBCFE8',
  statValue: '#FFF7ED',
  statBorder: 'rgba(251,207,232,0.45)',
  stageBorder: 'rgba(251,146,60,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#FB923C',
  glassBorder: 'rgba(251,146,60,0.35)',
  academyLabel: 'SOCIAL SENSORY LAB',
  approach: '#94A3B8',
  greet: '#F472B6',
} as const;

export type GreetingFriend = 'bear' | 'bunny' | 'robot' | 'teacher' | 'buddy';

export type GreetingGameRound = {
  id: string;
  friend: GreetingFriend;
  label: string;
  emoji: string;
  color: string;
  approach: Point & { radius: number };
  greet: Point & { radius: number };
  voiceApproach: string;
  voiceGreet: string;
  greetCue: string;
};

export const GREETING_GAME_THEME = {
  title: 'Greeting Game',
  subtitle: 'Approach each friend on the hello trail — then greet with calm posture, attention and a friendly hold!',
  emoji: '👋',
  hero: '🤝',
  accent: '#FB923C',
  accentPink: '#F472B6',
  glow: 'rgba(251,146,60,0.5)',
  bgGradient: ['#0F172A', '#7C2D12', '#831843', '#1E3A5F'] as [string, string, string, string],
  decor: ['👋', '🤝', '😊', '🌟', '🐻', '🐰', '🤖', '👩‍🏫'],
  hintText: 'Move to each friend — then hold your friendly greeting with steady body and attention!',
  positionCue: 'Face the camera so we can track your greeting adventure.',
  approachLabel: 'APPROACH!',
  greetLabel: 'SAY HELLO!',
  holdApproachLabel: 'HELLO SPOT!',
  holdGreetLabel: 'GREETING HOLD!',
  voiceIntro:
    'Welcome to the Greeting Game! Each round you approach a friend on the hello trail — then greet them with calm posture and steady attention.',
  voiceComplete: 'Wonderful greetings! You completed every friendly hello like a social sensory champion!',
  congrats: 'Greeting Game Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const gr = (
  id: string,
  friend: GreetingFriend,
  label: string,
  emoji: string,
  color: string,
  approach: Point,
  greet: Point,
  voiceApproach: string,
  voiceGreet: string,
  greetCue: string,
): GreetingGameRound => ({
  id,
  friend,
  label,
  emoji,
  color,
  approach: { ...approach, radius: 0.105 },
  greet: { ...greet, radius: 0.1 },
  voiceApproach,
  voiceGreet,
  greetCue,
});

export const GREETING_GAME_ROUNDS: GreetingGameRound[] = [
  gr(
    'bear',
    'bear',
    'Friendly Bear',
    '🐻',
    '#D97706',
    { x: 0.24, y: 0.4 },
    { x: 0.5, y: 0.48 },
    'Approach LEFT — say hello to the friendly bear!',
    'Greeting hold! Wave hello with calm body!',
    'Bear hello — steady and friendly!',
  ),
  gr(
    'bunny',
    'bunny',
    'Happy Bunny',
    '🐰',
    '#F472B6',
    { x: 0.76, y: 0.36 },
    { x: 0.5, y: 0.52 },
    'Approach RIGHT — greet the happy bunny!',
    'Greeting hold! Friendly eyes and posture!',
    'Bunny greeted — great social calm!',
  ),
  gr(
    'robot',
    'robot',
    'Robot Pal',
    '🤖',
    '#38BDF8',
    { x: 0.5, y: 0.22 },
    { x: 0.48, y: 0.5 },
    'Look UP — approach the robot pal!',
    'Greeting hold! Steady hello to robot!',
    'Robot hello — regulated body!',
  ),
  gr(
    'teacher',
    'teacher',
    'Kind Teacher',
    '👩‍🏫',
    '#A78BFA',
    { x: 0.3, y: 0.64 },
    { x: 0.5, y: 0.46 },
    'Approach the kind teacher below!',
    'Greeting hold! Polite hello with attention!',
    'Teacher greeted — wonderful focus!',
  ),
  gr(
    'buddy',
    'buddy',
    'Best Buddy',
    '🤝',
    '#34D399',
    { x: 0.7, y: 0.66 },
    { x: 0.5, y: 0.5 },
    'Final friend — approach your best buddy!',
    'Greeting hold! Champion hello!',
    'Buddy hello — adventure complete!',
  ),
];
