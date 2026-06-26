/**
 * OT Level 10 · Session 7 · Game 2 — Emotion Match · "Feeling Face Quest"
 *
 * Soft teal + rose emotion recognition palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const EMOTION_SHELL = {
  backText: '#A7F3D0',
  backBorder: 'rgba(167,243,208,0.35)',
  statLabel: '#FBCFE8',
  statValue: '#F0FDFA',
  statBorder: 'rgba(251,207,232,0.45)',
  stageBorder: 'rgba(45,212,191,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#2DD4BF',
  glassBorder: 'rgba(45,212,191,0.35)',
  academyLabel: 'SOCIAL SENSORY LAB',
  find: '#94A3B8',
  match: '#F472B6',
} as const;

export type EmotionKind = 'happy' | 'calm' | 'surprised' | 'proud' | 'kind';

export type EmotionMatchRound = {
  id: string;
  emotion: EmotionKind;
  label: string;
  emoji: string;
  color: string;
  find: Point & { radius: number };
  match: Point & { radius: number };
  voiceFind: string;
  voiceMatch: string;
  matchCue: string;
};

export const EMOTION_MATCH_THEME = {
  title: 'Emotion Match',
  subtitle: 'Find each feeling face — then match it with calm posture, attention and a steady emotion hold!',
  emoji: '😊',
  hero: '💗',
  accent: '#2DD4BF',
  accentRose: '#F472B6',
  glow: 'rgba(45,212,191,0.5)',
  bgGradient: ['#0F172A', '#134E4A', '#831843', '#312E81'] as [string, string, string, string],
  decor: ['😊', '😌', '😮', '🌟', '🥰', '💗', '✨', '🎭'],
  hintText: 'Find each emotion cue — then match the feeling with steady body and attention!',
  positionCue: 'Face the camera so we can track your emotion matching adventure.',
  findLabel: 'FIND IT!',
  matchLabel: 'MATCH!',
  holdFindLabel: 'FEELING!',
  holdMatchLabel: 'MATCH HOLD!',
  voiceIntro:
    'Welcome to Emotion Match! Each round you find a feeling face — then match that emotion with calm posture and steady attention.',
  voiceComplete: 'Amazing emotion matching! You matched every feeling like a social sensory champion!',
  congrats: 'Emotion Match Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const em = (
  id: string,
  emotion: EmotionKind,
  label: string,
  emoji: string,
  color: string,
  find: Point,
  match: Point,
  voiceFind: string,
  voiceMatch: string,
  matchCue: string,
): EmotionMatchRound => ({
  id,
  emotion,
  label,
  emoji,
  color,
  find: { ...find, radius: 0.105 },
  match: { ...match, radius: 0.1 },
  voiceFind,
  voiceMatch,
  matchCue,
});

export const EMOTION_MATCH_ROUNDS: EmotionMatchRound[] = [
  em(
    'happy',
    'happy',
    'Happy Face',
    '😊',
    '#FBBF24',
    { x: 0.24, y: 0.4 },
    { x: 0.5, y: 0.48 },
    'Find the HAPPY face on the left!',
    'Match hold! Show happy with calm body!',
    'Happy matched — bright and steady!',
  ),
  em(
    'calm',
    'calm',
    'Calm Face',
    '😌',
    '#2DD4BF',
    { x: 0.76, y: 0.36 },
    { x: 0.5, y: 0.52 },
    'Find RIGHT — the calm peaceful face!',
    'Match hold! Quiet body, calm attention!',
    'Calm matched — regulated body!',
  ),
  em(
    'surprised',
    'surprised',
    'Surprised Face',
    '😮',
    '#FB923C',
    { x: 0.5, y: 0.22 },
    { x: 0.48, y: 0.5 },
    'Look UP — find the surprised face!',
    'Match hold! Steady surprise match!',
    'Surprise matched — great focus!',
  ),
  em(
    'proud',
    'proud',
    'Proud Face',
    '🌟',
    '#A78BFA',
    { x: 0.3, y: 0.64 },
    { x: 0.5, y: 0.46 },
    'Find the proud star face below!',
    'Match hold! Proud posture and attention!',
    'Proud matched — wonderful!',
  ),
  em(
    'kind',
    'kind',
    'Kind Face',
    '🥰',
    '#F472B6',
    { x: 0.7, y: 0.66 },
    { x: 0.5, y: 0.5 },
    'Final feeling — find the kind heart face!',
    'Match hold! Kind emotion champion!',
    'Kind matched — quest complete!',
  ),
];
