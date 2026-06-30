/** Design tokens — OT Level 5 Session 5 · Game 3 · Orbit Eye */
export const ORBIT_EYE_THEME = {
  space: ['#0C0A1F', '#1E1B4B', '#312E81', '#4C1D95'] as const,
  ring: 'rgba(167,139,250,0.45)',
  ringGlow: 'rgba(139,92,246,0.2)',
  planet: '#A78BFA',
  planetCore: '#EDE9FE',
  planetGlow: 'rgba(167,139,250,0.55)',
  star: '#FDE68A',
  nebula: 'rgba(139,92,246,0.12)',
  dot: '#A78BFA',
  dotGlow: 'rgba(167,139,250,0.5)',
  hudGlass: 'rgba(30,27,75,0.9)',
  hudBorder: 'rgba(167,139,250,0.4)',
  title: '#E9D5FF',
  subtitle: '#C4B5FD',
  accent: '#A78BFA',
  accentDark: '#8B5CF6',
} as const;

export const ORBIT_EYE_COPY = {
  title: 'Orbit Eye',
  emoji: '⭕',
  subtitle: 'Circular Path · Smooth Pursuit',
  introDescription:
    'A glowing planet orbits the cosmic ring. Trace the circle with your eyes to build smooth pursuit strength!',
  ttsIntro: 'Welcome to Orbit Eye! Follow the planet around the circle!',
  ttsCue: 'Watch carefully! Trace the orbit with your eyes.',
  ttsTrack: 'Follow the dot around the circle!',
  ttsComplete: 'Stellar! Your smooth pursuit is out of this world!',
  congratsMessage: 'Orbit Champion!',
  logType: 'circular-track',
  skillTags: ['eye-muscle-strength', 'circular-tracking', 'smooth-pursuit'],
} as const;
