/**
 * Design tokens — OT Level 5 Session 3 · Game 3 · Comet Chase
 * Palette: deep violet cosmos + lavender comet tail (figure-8 pursuit)
 */

export const COMET_CHASE_THEME = {
  space: ['#020617', '#0F172A', '#1E1B4B', '#312E81'] as const,
  nebula: 'rgba(139,92,246,0.15)',
  nebulaPink: 'rgba(236,72,153,0.1)',
  pathGlow: 'rgba(167,139,250,0.3)',
  pathCore: '#A78BFA',
  pathDash: '#8B5CF6',
  star: '#E2E8F0',
  starDim: 'rgba(226,232,240,0.3)',
  cometHead: '#C4B5FD',
  cometCore: '#EDE9FE',
  cometTail: 'rgba(167,139,250,0.55)',
  cometGlow: 'rgba(139,92,246,0.5)',
  stardust: '#DDD6FE',
  stardustGlow: 'rgba(221,214,254,0.45)',
  tether: 'rgba(167,139,250,0.6)',
  orbitLock: '#A78BFA',
  orbitLockGlow: 'rgba(167,139,250,0.4)',
  hudGlass: 'rgba(15,23,42,0.88)',
  hudBorder: 'rgba(167,139,250,0.4)',
  title: '#F5F3FF',
  subtitle: '#C4B5FD',
  accent: '#A78BFA',
  accentDark: '#7C3AED',
  success: '#34D399',
} as const;

export const COMET_CHASE_COPY = {
  title: 'Comet Chase',
  emoji: '☄️',
  subtitle: 'Night Sky · Figure-8 Path',
  introDescription:
    'A glowing comet sweeps through a figure-eight across the night sky. Drag your stardust puck onto the comet and hold for 3 seconds to lock onto its orbit!',
  skills: ['Figure-8 tracking', 'Complex pursuit', 'Visual-motor sync', 'Curve following'],
  ttsIntro: 'Chase the comet along its cosmic path!',
  ttsCue: 'Follow the comet!',
  ttsSuccess: 'Cosmic lock!',
  ttsLost: 'Stay on the comet!',
  ttsComplete: 'Amazing! You are a comet champion!',
  congratsMessage: 'Comet Catcher!',
  logType: 'drag-comet',
  skillTags: ['figure-eight-tracking', 'complex-pursuit', 'visual-motor'],
  followHint: '☄️ Drag to chase the comet!',
  progressHint: '✨ Locking orbit — hold steady!',
  lostHint: '👆 Keep up with the comet!',
} as const;
