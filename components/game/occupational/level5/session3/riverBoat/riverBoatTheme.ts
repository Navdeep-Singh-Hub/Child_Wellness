/**
 * Design tokens — OT Level 5 Session 3 · Game 4 · River Boat
 * Palette: serene aqua river + teal sailboat accents
 */

export const RIVER_BOAT_THEME = {
  sky: ['#ECFEFF', '#CFFAFE', '#A5F3FC', '#67E8F9'] as const,
  river: '#0891B2',
  riverDeep: '#0E7490',
  riverShallow: '#22D3EE',
  riverGlow: 'rgba(6,182,212,0.25)',
  bank: '#86EFAC',
  bankDark: '#4ADE80',
  reed: '#15803D',
  lily: '#34D399',
  pathGlow: 'rgba(34,211,238,0.3)',
  pathCore: '#22D3EE',
  wake: 'rgba(255,255,255,0.55)',
  wakeGlow: 'rgba(165,243,252,0.4)',
  hull: '#0E7490',
  hullLight: '#0891B2',
  sail: '#F0FDFA',
  sailStripe: '#06B6D4',
  mast: '#155E75',
  captain: '#67E8F9',
  captainGlow: 'rgba(103,232,249,0.45)',
  rope: 'rgba(6,182,212,0.55)',
  sailMeter: '#06B6D4',
  sailMeterGlow: 'rgba(6,182,212,0.35)',
  hudGlass: 'rgba(255,255,255,0.9)',
  hudBorder: 'rgba(6,182,212,0.4)',
  title: '#0E7490',
  subtitle: '#0891B2',
  accent: '#06B6D4',
  accentDark: '#0891B2',
  success: '#10B981',
} as const;

export const RIVER_BOAT_COPY = {
  title: 'River Boat',
  emoji: '⛵',
  subtitle: 'Waterway · Vertical Track',
  introDescription:
    'A little sailboat bobs up and down the river channel. Drag your captain puck onto the boat and hold for 3 seconds to ride each voyage!',
  skills: ['Vertical tracking', 'Drag pursuit', 'Rhythm control', 'Flow following'],
  ttsIntro: 'Set sail! Follow the boat up and down the river!',
  ttsCue: 'Stay on the boat!',
  ttsSuccess: 'Smooth sailing!',
  ttsLost: 'Keep up with the boat!',
  ttsComplete: 'Wonderful! You are a true river captain!',
  congratsMessage: 'River Captain!',
  logType: 'drag-river',
  skillTags: ['vertical-tracking', 'drag-pursuit', 'rhythm-control'],
  followHint: '⛵ Drag to board the boat!',
  progressHint: '🌊 Catching wind — hold steady!',
  lostHint: '👆 Stay on the boat!',
} as const;
