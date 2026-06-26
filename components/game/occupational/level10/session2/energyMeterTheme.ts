/**
 * OT Level 10 · Session 2 · Game 5 — Energy Meter · "Neon Pulse Station"
 *
 * Electric cyan + magenta + amber gauge — futuristic regulation palette,
 * distinct from all Session 2 games.
 */

export const PULSE_SHELL = {
  backText: '#A5F3FC',
  backBorder: 'rgba(165,243,252,0.35)',
  statLabel: '#F0ABFC',
  statValue: '#F0FDFA',
  statBorder: 'rgba(240,171,252,0.45)',
  stageBorder: 'rgba(34,211,238,0.5)',
  stageBg: 'rgba(15,23,42,0.75)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  sparkleColor: '#22D3EE',
  glassBorder: 'rgba(34,211,238,0.35)',
  academyLabel: 'ENERGY REGULATION LAB',
} as const;

export type EnergyLevelId = 'sleepy' | 'calm' | 'steady' | 'active' | 'reset';

export type EnergyRound = {
  id: EnergyLevelId;
  label: string;
  emoji: string;
  target: number;
  color: string;
  glow: string;
  voiceCue: string;
  matchCue: string;
  motionHint: string;
};

export const ENERGY_METER_THEME = {
  title: 'Energy Meter',
  subtitle: 'Read the neon energy gauge — adjust your body movement to match each target level!',
  emoji: '⚡',
  hero: '📊',
  accent: '#22D3EE',
  accentMagenta: '#E879F9',
  accentAmber: '#FBBF24',
  glow: 'rgba(34,211,238,0.5)',
  bgGradient: ['#020617', '#0F172A', '#4A044E', '#0891B2'] as [string, string, string, string],
  decor: ['⚡', '📊', '💫', '🔋', '✨', '🌊', '💜', '🎚️'],
  hintText: 'Watch the target line — move your body to match the energy level on the meter.',
  positionCue: 'Face the camera so we can read your movement energy.',
  readLabel: 'READ METER…',
  matchLabel: 'MATCH IT!',
  holdLabel: 'HOLD LEVEL…',
  voiceIntro:
    'Welcome to the Neon Pulse Station! Each round shows a target energy level. Adjust how much you move to match the meter — then hold steady!',
  voiceComplete: 'Energy master! You regulated your body through every level on the meter!',
  congrats: 'Energy Regulator!',
  skillTags: [
    'self-regulation',
    'energy-awareness',
    'sensory-integration',
    'adaptive-responses',
    'motor-planning',
  ],
} as const;

/** Five-round energy arc: low → rise → peak → reset (self-regulation). */
export const ENERGY_ROUNDS: EnergyRound[] = [
  {
    id: 'sleepy',
    label: 'Sleepy Low',
    emoji: '😴',
    target: 0.15,
    color: '#67E8F9',
    glow: 'rgba(103,232,249,0.5)',
    voiceCue: 'Level one: SLEEPY LOW energy. Stay very still like a calm cloud.',
    matchCue: 'Almost no movement — sleepy low energy!',
    motionHint: 'Be very still',
  },
  {
    id: 'calm',
    label: 'Calm Glow',
    emoji: '🌊',
    target: 0.35,
    color: '#2DD4BF',
    glow: 'rgba(45,212,191,0.5)',
    voiceCue: 'Level two: CALM glow. Gentle tiny movements only.',
    matchCue: 'Soft calm energy — small gentle moves.',
    motionHint: 'Tiny gentle moves',
  },
  {
    id: 'steady',
    label: 'Steady Flow',
    emoji: '🎵',
    target: 0.55,
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.5)',
    voiceCue: 'Level three: STEADY flow. Move with a smooth, even rhythm!',
    matchCue: 'Steady medium energy — smooth rhythm!',
    motionHint: 'Smooth even rhythm',
  },
  {
    id: 'active',
    label: 'Active Spark',
    emoji: '⚡',
    target: 0.78,
    color: '#F472B6',
    glow: 'rgba(244,114,182,0.55)',
    voiceCue: 'Level four: ACTIVE spark! More movement — but stay in control!',
    matchCue: 'Active controlled energy — move more!',
    motionHint: 'More controlled motion',
  },
  {
    id: 'reset',
    label: 'Calm Reset',
    emoji: '🕊️',
    target: 0.2,
    color: '#FDE68A',
    glow: 'rgba(253,230,138,0.5)',
    voiceCue: 'Final level: CALM RESET! Bring your energy back down peacefully.',
    matchCue: 'Reset low — slow your body back to calm!',
    motionHint: 'Slow back to calm',
  },
];
