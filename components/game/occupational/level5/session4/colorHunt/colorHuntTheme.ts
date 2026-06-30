/**
 * Design tokens — OT Level 5 Session 4 · Game 5 · Color Hunt
 * Palette: prism lab lavender + rainbow refraction
 */

export const COLOR_HUNT_THEME = {
  lab: ['#FDF4FF', '#FAE8FF', '#F3E8FF', '#EDE9FE'] as const,
  prism: '#EC4899',
  prismDark: '#DB2777',
  prismGlow: 'rgba(236,72,153,0.35)',
  beam: 'rgba(139,92,246,0.12)',
  beamPink: 'rgba(236,72,153,0.15)',
  beamBlue: 'rgba(59,130,246,0.12)',
  beamGreen: 'rgba(16,185,129,0.1)',
  orbBorder: 'rgba(255,255,255,0.85)',
  orbShadow: 'rgba(91,33,182,0.2)',
  targetRing: '#EC4899',
  targetGlow: 'rgba(236,72,153,0.45)',
  found: '#34D399',
  foundGlow: 'rgba(52,211,153,0.35)',
  wrong: '#F87171',
  wrongGlow: 'rgba(248,113,113,0.35)',
  hudGlass: 'rgba(255,255,255,0.9)',
  hudBorder: 'rgba(236,72,153,0.35)',
  title: '#5B21B6',
  subtitle: '#7C3AED',
  accent: '#EC4899',
  accentDark: '#DB2777',
  swatchBorder: '#A855F7',
} as const;

export const COLOR_HUNT_COLORS = [
  { name: 'Red', emoji: '🔴', color: '#EF4444' },
  { name: 'Blue', emoji: '🔵', color: '#3B82F6' },
  { name: 'Green', emoji: '🟢', color: '#10B981' },
  { name: 'Yellow', emoji: '🟡', color: '#FCD34D' },
  { name: 'Purple', emoji: '🟣', color: '#8B5CF6' },
  { name: 'Orange', emoji: '🟠', color: '#F97316' },
] as const;

export const COLOR_HUNT_COPY = {
  title: 'Color Hunt',
  emoji: '🎨',
  subtitle: 'Prism Lab · Selective Focus',
  introDescription:
    'A rainbow of orbs fills the prism lab. Tap every orb of the target color to clear each round!',
  skills: ['Selective focus', 'Color recognition', 'Attention', 'Visual filtering'],
  ttsIntro: 'Welcome to the Prism Lab! Hunt every orb of the target color!',
  ttsRound: (color: string) => `Find all ${color.toLowerCase()} orbs!`,
  ttsFound: 'Good!',
  ttsWrong: 'Find the correct color!',
  ttsRoundClear: 'Round complete!',
  ttsComplete: 'Amazing! You mastered every color hunt!',
  congratsMessage: 'Color Expert!',
  logType: 'spot-the-color',
  skillTags: ['selective-focus', 'color-recognition', 'attention'],
  hintTarget: (color: string, remaining: number) => `🎨 Find all ${color} · ${remaining} left`,
} as const;
