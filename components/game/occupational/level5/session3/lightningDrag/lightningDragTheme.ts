/**
 * Design tokens — OT Level 5 Session 3 · Game 5 · Lightning Drag
 * Palette: storm slate clouds + electric gold lightning
 */

export const LIGHTNING_DRAG_THEME = {
  sky: ['#0F172A', '#1E293B', '#334155', '#475569'] as const,
  cloud: 'rgba(100,116,139,0.55)',
  cloudDark: 'rgba(51,65,85,0.7)',
  rain: 'rgba(148,163,184,0.35)',
  pathGlow: 'rgba(250,204,21,0.25)',
  pathCore: '#FACC15',
  pathDash: '#EAB308',
  bolt: '#FDE047',
  boltCore: '#FEF9C3',
  boltGlow: 'rgba(250,204,21,0.6)',
  spark: '#FEF08A',
  sparkTrail: 'rgba(254,240,138,0.4)',
  stormPuck: '#FACC15',
  stormPuckGlow: 'rgba(250,204,21,0.45)',
  arc: 'rgba(250,204,21,0.65)',
  charge: '#FBBF24',
  chargeGlow: 'rgba(251,191,36,0.4)',
  hudGlass: 'rgba(30,41,59,0.9)',
  hudBorder: 'rgba(250,204,21,0.35)',
  title: '#F8FAFC',
  subtitle: '#CBD5E1',
  accent: '#FACC15',
  accentDark: '#EAB308',
  success: '#34D399',
} as const;

export const LIGHTNING_DRAG_COPY = {
  title: 'Lightning Drag',
  emoji: '⚡',
  subtitle: 'Storm Chase · Zigzag Path',
  introDescription:
    'A lightning bolt zigzags across storm clouds. Drag your storm puck onto the bolt and hold for 3 seconds to channel each strike!',
  skills: ['Zigzag tracking', 'Fast pursuit', 'Reaction timing', 'Direction changes'],
  ttsIntro: 'Enter the storm! Follow the lightning bolt!',
  ttsCue: 'Stay on the bolt!',
  ttsSuccess: 'Zap!',
  ttsLost: 'Keep up with the bolt!',
  ttsComplete: 'Incredible! You rode every lightning strike!',
  congratsMessage: 'Storm Rider!',
  logType: 'drag-lightning',
  skillTags: ['zigzag-tracking', 'fast-pursuit', 'reaction-timing'],
  followHint: '⚡ Drag to catch the bolt!',
  progressHint: '⚡ Charging — hold steady!',
  lostHint: '👆 Stay locked on the bolt!',
} as const;
