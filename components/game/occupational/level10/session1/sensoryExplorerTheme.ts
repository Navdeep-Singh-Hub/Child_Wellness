/**
 * OT Level 10 · Session 1 — Sensory Awareness
 * Game 1: Sensory Explorer · "Aurora Sensory Quest"
 *
 * Iridescent aurora palette — distinct from L6 superhero, L9 candy-lab, L7 space.
 * Cool teals + warm corals + soft lavenders = balanced sensory stimulation without overload.
 */

export const SENSORY_SHELL = {
  backText: '#CFFAFE',
  backBorder: 'rgba(165,243,252,0.4)',
  statLabel: '#67E8F9',
  statValue: '#FDE68A',
  statBorder: 'rgba(103,232,249,0.4)',
  stageBorder: 'rgba(167,139,250,0.5)',
  stageBg: 'rgba(8,18,38,0.55)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#A5F3FC',
  glassBorder: 'rgba(199,210,254,0.35)',
  academyLabel: 'SENSORY INTEGRATION LAB',
} as const;

export type SensoryZoneId = 'touch' | 'left' | 'right' | 'sky' | 'calm';

export type SensoryZoneTheme = {
  id: SensoryZoneId;
  label: string;
  story: string;
  emoji: string;
  color: string;
  glow: string;
  voiceCue: string;
};

export const SENSORY_EXPLORER_THEME = {
  title: 'Sensory Explorer',
  subtitle: 'Journey through aurora portals — move your body to collect each sensory crystal!',
  emoji: '🌈',
  hero: '✨',
  accent: '#22D3EE',
  accentDeep: '#0891B2',
  accentWarm: '#FB923C',
  glow: 'rgba(34,211,238,0.55)',
  bgGradient: ['#050B1A', '#0F2847', '#1E4D6B', '#7C3AED'] as [string, string, string, string],
  decor: ['🌊', '💫', '🫧', '🔮', '🌸', '✨', '🦋', '🌙'],
  hintText: 'Move your head to guide the glowing explorer dot onto each crystal portal.',
  positionCue: 'Step back so the camera can see your face, shoulders and hands.',
  holdCue: 'Hold steady on the crystal!',
  voiceIntro:
    'Welcome, Sensory Explorer! Travel through the aurora and collect each glowing crystal with your movement.',
  voiceComplete: 'Amazing exploration! You integrated every sensory portal beautifully!',
  congrats: 'Sensory Integration Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'attention',
  ],
} as const;

export const SENSORY_ZONES: SensoryZoneTheme[] = [
  {
    id: 'touch',
    label: 'Touch Wave',
    story: 'Feel the gentle ripple portal at the center.',
    emoji: '🌊',
    color: '#22D3EE',
    glow: 'rgba(34,211,238,0.6)',
    voiceCue: 'Guide your dot to the teal wave crystal in the center!',
  },
  {
    id: 'left',
    label: 'Left Aurora',
    story: 'Glide left through the lavender mist.',
    emoji: '💜',
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.6)',
    voiceCue: 'Move left toward the purple aurora crystal!',
  },
  {
    id: 'right',
    label: 'Right Spark',
    story: 'Reach right into the warm coral glow.',
    emoji: '🧡',
    color: '#FB923C',
    glow: 'rgba(251,146,60,0.6)',
    voiceCue: 'Slide right to the coral spark crystal!',
  },
  {
    id: 'sky',
    label: 'Sky Sense',
    story: 'Lift up toward the starlit sky portal.',
    emoji: '⭐',
    color: '#FDE68A',
    glow: 'rgba(253,230,138,0.65)',
    voiceCue: 'Reach up high to the golden sky crystal!',
  },
  {
    id: 'calm',
    label: 'Calm Core',
    story: 'Find stillness in the peaceful green heart.',
    emoji: '🫧',
    color: '#86EFAC',
    glow: 'rgba(134,239,172,0.6)',
    voiceCue: 'Hold calm and steady on the green peace crystal!',
  },
];
