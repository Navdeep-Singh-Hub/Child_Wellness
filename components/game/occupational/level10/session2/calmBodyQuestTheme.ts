/**
 * OT Level 10 · Session 2 · Game 4 — Calm Body Quest · "Serene Moon Garden"
 *
 * Soft lavender + sage + mist pearl — peaceful quest palette,
 * distinct from Cloud Loft, Twilight Path and Forge Yard.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const GARDEN_SHELL = {
  backText: '#EDE9FE',
  backBorder: 'rgba(237,233,254,0.35)',
  statLabel: '#A7F3D0',
  statValue: '#F5F3FF',
  statBorder: 'rgba(167,243,208,0.4)',
  stageBorder: 'rgba(196,181,253,0.5)',
  stageBg: 'rgba(30,27,75,0.65)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#C4B5FD',
  glassBorder: 'rgba(196,181,253,0.35)',
  academyLabel: 'CALM BODY QUEST LAB',
} as const;

export type CalmPoseType = 'still' | 'soft-hands' | 'quiet-head' | 'centered' | 'peace';

export type CalmSanctuary = Point & {
  id: string;
  pose: CalmPoseType;
  label: string;
  emoji: string;
  color: string;
  radius: number;
  voiceCue: string;
  calmCue: string;
};

export const CALM_BODY_QUEST_THEME = {
  title: 'Calm Body Quest',
  subtitle: 'Journey through moonlit calm sanctuaries — arrive gently, then hold your body still and peaceful!',
  emoji: '🧘',
  hero: '🌙',
  accent: '#A78BFA',
  accentSage: '#6EE7B7',
  accentMist: '#C4B5FD',
  glow: 'rgba(167,139,250,0.5)',
  bgGradient: ['#1E1B4B', '#312E81', '#134E4A', '#4C1D95'] as [string, string, string, string],
  decor: ['🌙', '🧘', '🪷', '✨', '🍃', '💜', '🕊️', '🌸'],
  hintText: 'Glide to each calm sanctuary, then hold your body quiet and still.',
  positionCue: 'Face the camera — we track your stillness, posture and attention.',
  questLabel: 'QUEST…',
  calmLabel: 'BE CALM…',
  stillLabel: 'HOLD STILL…',
  moveCue: 'Too much movement — find your calm stillness…',
  voiceIntro:
    'Welcome to the Serene Moon Garden! Visit each calm sanctuary. Arrive gently, then hold your body still like a peaceful statue.',
  voiceComplete: 'Beautiful calm! You completed the whole body quest with wonderful regulation!',
  congrats: 'Calm Body Champion!',
  skillTags: [
    'self-regulation',
    'body-awareness',
    'sensory-integration',
    'adaptive-responses',
    'attention',
  ],
} as const;

export const CALM_SANCTUARIES: CalmSanctuary[] = [
  {
    id: 'still-statue',
    pose: 'still',
    label: 'Still Statue',
    emoji: '🗿',
    color: '#C4B5FD',
    x: 0.2,
    y: 0.55,
    radius: 0.105,
    voiceCue: 'Quest to the still statue sanctuary — then freeze like a calm statue!',
    calmCue: 'Hold perfectly still at the statue…',
  },
  {
    id: 'soft-hands',
    pose: 'soft-hands',
    label: 'Soft Hands',
    emoji: '🤲',
    color: '#6EE7B7',
    x: 0.38,
    y: 0.38,
    radius: 0.1,
    voiceCue: 'Find the soft hands sanctuary — rest your hands low and calm!',
    calmCue: 'Soft hands down — stay quiet and still…',
  },
  {
    id: 'quiet-head',
    pose: 'quiet-head',
    label: 'Quiet Head',
    emoji: '😌',
    color: '#A78BFA',
    x: 0.55,
    y: 0.58,
    radius: 0.095,
    voiceCue: 'Reach the quiet head garden — keep your head gentle and still!',
    calmCue: 'Quiet head — no wiggles, just calm…',
  },
  {
    id: 'centered',
    pose: 'centered',
    label: 'Centered Calm',
    emoji: '🎯',
    color: '#F0ABFC',
    x: 0.68,
    y: 0.36,
    radius: 0.1,
    voiceCue: 'Glide to the centered calm orb — balance your body in the middle!',
    calmCue: 'Stay centered — calm and balanced…',
  },
  {
    id: 'peace-bloom',
    pose: 'peace',
    label: 'Peace Bloom',
    emoji: '🪷',
    color: '#FDE68A',
    x: 0.82,
    y: 0.52,
    radius: 0.105,
    voiceCue: 'Final sanctuary — peace bloom! Full calm body hold!',
    calmCue: 'Peace bloom — your whole body is calm…',
  },
];
