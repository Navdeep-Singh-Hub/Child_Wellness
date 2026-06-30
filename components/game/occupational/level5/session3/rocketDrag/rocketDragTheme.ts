/**
 * Design tokens — OT Level 5 Session 3 · Game 1 · Rocket Drag
 * Palette: deep space launch corridor + indigo/violet thrusters
 */

export const ROCKET_DRAG_THEME = {
  space: ['#020617', '#0F172A', '#1E1B4B', '#312E81'] as const,
  lane: 'rgba(129,140,248,0.2)',
  laneBright: 'rgba(165,180,252,0.45)',
  laneDash: 'rgba(99,102,241,0.35)',
  star: '#E0E7FF',
  starDim: 'rgba(224,231,255,0.35)',
  nebula: 'rgba(99,102,241,0.12)',
  rocketBody: '#4F46E5',
  rocketNose: '#818CF8',
  rocketFin: '#6366F1',
  exhaust: '#A5B4FC',
  exhaustGlow: 'rgba(165,180,252,0.55)',
  dock: '#C7D2FE',
  dockGlow: 'rgba(199,210,254,0.5)',
  tether: 'rgba(129,140,248,0.65)',
  tetherGlow: 'rgba(165,180,252,0.35)',
  fuel: '#34D399',
  fuelGlow: 'rgba(52,211,153,0.4)',
  hudGlass: 'rgba(15,23,42,0.88)',
  hudBorder: 'rgba(129,140,248,0.45)',
  title: '#E0E7FF',
  subtitle: '#A5B4FC',
  accent: '#818CF8',
  accentDark: '#6366F1',
  success: '#34D399',
} as const;

export const ROCKET_DRAG_COPY = {
  title: 'Rocket Drag',
  emoji: '🚀',
  subtitle: 'Space Lane · Smooth Pursuit',
  introDescription:
    'A rocket sweeps across the star lane. Drag your docking puck onto the rocket and hold steady for 3 seconds to complete each orbit!',
  skills: ['Drag tracking', 'Smooth pursuit', 'Visual-motor sync', 'Sustained attention'],
  ttsIntro: 'Welcome to Rocket Drag! Follow the rocket across the stars!',
  ttsCue: 'Dock onto the rocket and hold!',
  ttsSuccess: 'Docked!',
  ttsLost: 'Stay on the rocket!',
  ttsComplete: 'Stellar! You mastered every launch lane!',
  congratsMessage: 'Space Tracker!',
  logType: 'drag-rocket',
  skillTags: ['drag-tracking', 'smooth-pursuit', 'visual-motor'],
  followHint: '🚀 Drag to dock on the rocket!',
  progressHint: '⚡ Fueling up — hold steady!',
  lostHint: '👆 Keep your puck on the rocket!',
} as const;
