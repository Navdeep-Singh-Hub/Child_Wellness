/**
 * OT Level 10 · Session 2 · Game 1 — Balloon Breathing · "Cloud Loft Sanctuary"
 *
 * Soft sky + blush sunrise palette — calming regulation aesthetic.
 */

export const CLOUD_SHELL = {
  backText: '#0C4A6E',
  backBorder: 'rgba(12,74,110,0.25)',
  statLabel: '#0369A1',
  statValue: '#0C4A6E',
  statBorder: 'rgba(56,189,248,0.45)',
  stageBorder: 'rgba(251,207,232,0.55)',
  stageBg: 'rgba(224,242,254,0.55)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  sparkleColor: '#FBCFE8',
  glassBorder: 'rgba(56,189,248,0.35)',
  academyLabel: 'REGULATION MOVEMENT LAB',
} as const;

export type BreathBalloonColor = {
  fill: string;
  glow: string;
  string: string;
};

export const BALLOON_BREATHING_THEME = {
  title: 'Balloon Breathing',
  subtitle: 'Breathe with the floating balloon — raise your arms slowly on inhale, lower on exhale to stay calm!',
  emoji: '🎈',
  hero: '☁️',
  accent: '#38BDF8',
  accentBlush: '#FDA4AF',
  accentLavender: '#C4B5FD',
  glow: 'rgba(56,189,248,0.45)',
  bgGradient: ['#E0F2FE', '#BAE6FD', '#FBCFE8', '#FEF3C7'] as [string, string, string, string],
  decor: ['☁️', '🎈', '🕊️', '✨', '🌤️', '💨', '🫧', '🌸'],
  hintText: 'Match the balloon — arms up as it grows, arms down as it shrinks.',
  positionCue: 'Sit where the camera sees your face, shoulders and hands.',
  inhaleLabel: 'INHALE…',
  holdLabel: 'HOLD…',
  exhaleLabel: 'EXHALE…',
  restLabel: 'REST…',
  voiceIntro:
    'Welcome to the Cloud Loft! Watch the balloon breathe with you. Slowly raise your arms when it grows, and lower them when it shrinks.',
  voiceComplete: 'Beautiful breathing! You regulated your body like a calm cloud dancer!',
  congrats: 'Breath Champion!',
  skillTags: [
    'self-regulation',
    'sensory-integration',
    'breath-awareness',
    'motor-planning',
    'adaptive-responses',
  ],
} as const;

export const BREATH_BALLOONS: BreathBalloonColor[] = [
  { fill: '#FDA4AF', glow: 'rgba(253,164,175,0.55)', string: '#F472B6' },
  { fill: '#7DD3FC', glow: 'rgba(125,211,252,0.55)', string: '#38BDF8' },
  { fill: '#C4B5FD', glow: 'rgba(196,181,253,0.55)', string: '#A78BFA' },
  { fill: '#FDE68A', glow: 'rgba(253,230,138,0.55)', string: '#FBBF24' },
  { fill: '#86EFAC', glow: 'rgba(134,239,172,0.55)', string: '#22C55E' },
];

export const BREATH_VOICE_CUES = [
  'Breathe in — lift your arms gently!',
  'Slow inhale — let the balloon rise!',
  'Fill the balloon — arms up, nice and slow!',
  'Inhale calm — exhale worry away!',
  'Last breath — you are doing wonderfully!',
] as const;
