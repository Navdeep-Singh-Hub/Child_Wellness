/**
 * OT Level 10 · Session 1 · Game 2 — Find The Sound · "Echo Cavern Quest"
 *
 * Warm amber + deep violet cavern palette with golden sound ripples —
 * distinct from Game 1's cool aurora look.
 */

import type { SensoryOrbTarget } from '@/components/game/occupational/level10/session1/session1Pacing';

export const ECHO_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.4)',
  statLabel: '#FCD34D',
  statValue: '#FFFBEB',
  statBorder: 'rgba(252,211,77,0.45)',
  stageBorder: 'rgba(167,139,250,0.5)',
  stageBg: 'rgba(20,10,35,0.6)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  sparkleColor: '#FDE68A',
  glassBorder: 'rgba(216,180,254,0.35)',
  academyLabel: 'AUDITORY SENSORY LAB',
} as const;

export type SoundDirection = 'left' | 'right' | 'up' | 'down' | 'center';

export type SoundChallenge = SensoryOrbTarget & {
  direction: SoundDirection;
  soundKey: 'bell' | 'drum' | 'beep' | 'splash' | 'clap';
  emoji: string;
  label: string;
  listenCue: string;
  seekCue: string;
  voiceDirection: string;
  playbackRate: number;
};

export const FIND_THE_SOUND_THEME = {
  title: 'Find The Sound',
  subtitle: 'Listen to each hidden echo, then move your body to find where the sound lives!',
  emoji: '🔊',
  hero: '🎧',
  accent: '#F59E0B',
  accentDeep: '#B45309',
  accentCool: '#A78BFA',
  glow: 'rgba(245,158,11,0.55)',
  bgGradient: ['#140A24', '#3B1F6E', '#7C2D12', '#F59E0B'] as [string, string, string, string],
  decor: ['🔊', '🎵', '〰️', '✨', '🦇', '💫', '🎶', '🌙'],
  hintText: 'Listen first — then guide your dot to the glowing sound portal.',
  positionCue: 'Face the camera so we can track your head and shoulders.',
  listenPhaseLabel: 'LISTEN…',
  seekPhaseLabel: 'FIND IT!',
  voiceIntro:
    'Welcome to the Echo Cavern! Listen carefully to each sound, then move your body to find where it is hiding.',
  voiceComplete: 'Incredible listening! You found every sound in the cavern!',
  congrats: 'Sound Seeker Champion!',
  skillTags: [
    'auditory-localization',
    'sensory-integration',
    'adaptive-responses',
    'motor-planning',
    'attention',
  ],
} as const;

export const SOUND_CHALLENGES: SoundChallenge[] = [
  {
    direction: 'left',
    zoneId: 'touch',
    soundKey: 'bell',
    emoji: '🔔',
    label: 'Chime Echo',
    x: 0.14,
    y: 0.5,
    radius: 0.105,
    listenCue: 'A soft chime is ringing…',
    seekCue: 'Move left toward the chime!',
    voiceDirection: 'The chime is on your left. Move left to find it!',
    playbackRate: 1,
  },
  {
    direction: 'right',
    zoneId: 'left',
    soundKey: 'drum',
    emoji: '🥁',
    label: 'Drum Pulse',
    x: 0.86,
    y: 0.5,
    radius: 0.105,
    listenCue: 'Hear the deep drum beat…',
    seekCue: 'Slide right to the drum!',
    voiceDirection: 'The drum is on your right. Go right!',
    playbackRate: 0.95,
  },
  {
    direction: 'up',
    zoneId: 'sky',
    soundKey: 'beep',
    emoji: '🎵',
    label: 'High Tone',
    x: 0.5,
    y: 0.17,
    radius: 0.095,
    listenCue: 'A high note floats above…',
    seekCue: 'Reach up to the high sound!',
    voiceDirection: 'The sound is up high. Look up!',
    playbackRate: 1.25,
  },
  {
    direction: 'down',
    zoneId: 'right',
    soundKey: 'splash',
    emoji: '💧',
    label: 'Low Ripple',
    x: 0.5,
    y: 0.8,
    radius: 0.1,
    listenCue: 'A low ripple rumbles below…',
    seekCue: 'Tilt down toward the ripple!',
    voiceDirection: 'The sound is down low. Look down!',
    playbackRate: 0.88,
  },
  {
    direction: 'center',
    zoneId: 'calm',
    soundKey: 'clap',
    emoji: '👏',
    label: 'Center Clap',
    x: 0.5,
    y: 0.46,
    radius: 0.1,
    listenCue: 'A clap echoes from the center…',
    seekCue: 'Find the clap in the middle!',
    voiceDirection: 'The clap is right in front of you. Move to the center!',
    playbackRate: 1,
  },
];
