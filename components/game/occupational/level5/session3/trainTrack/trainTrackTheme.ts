/**
 * Design tokens — OT Level 5 Session 3 · Game 2 · Train Track
 * Palette: sunny countryside railroad + amber/golden rails
 */

export const TRAIN_TRACK_THEME = {
  sky: ['#FEF9C3', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  grass: '#86EFAC',
  grassDark: '#4ADE80',
  rail: '#78350F',
  railSteel: '#92400E',
  railTie: '#451A03',
  railGlow: 'rgba(245,158,11,0.35)',
  steam: 'rgba(255,255,255,0.75)',
  steamGlow: 'rgba(254,243,199,0.5)',
  trainBody: '#D97706',
  trainCab: '#B45309',
  trainWindow: '#FEF3C7',
  trainWheel: '#451A03',
  conductor: '#FCD34D',
  conductorGlow: 'rgba(252,211,77,0.5)',
  tether: 'rgba(245,158,11,0.55)',
  steamMeter: '#F59E0B',
  steamMeterGlow: 'rgba(245,158,11,0.4)',
  hudGlass: 'rgba(255,255,255,0.9)',
  hudBorder: 'rgba(245,158,11,0.45)',
  title: '#78350F',
  subtitle: '#92400E',
  accent: '#F59E0B',
  accentDark: '#D97706',
  success: '#16A34A',
} as const;

export const TRAIN_TRACK_COPY = {
  title: 'Train Track',
  emoji: '🚂',
  subtitle: 'Rail Loop · Circular Pursuit',
  introDescription:
    'A little steam engine chugs around the oval track. Drag your conductor puck onto the engine and hold steady for 3 seconds to complete each lap!',
  skills: ['Circular tracking', 'Drag control', 'Motor planning', 'Sustained pursuit'],
  ttsIntro: 'All aboard! Follow the train around the track!',
  ttsCue: 'Stay on the engine!',
  ttsSuccess: 'On track!',
  ttsLost: 'Keep up with the train!',
  ttsComplete: 'Amazing! You are a master conductor!',
  congratsMessage: 'Track Master!',
  logType: 'drag-train',
  skillTags: ['circular-tracking', 'drag-control', 'motor-planning'],
  followHint: '🚂 Drag to ride the engine!',
  progressHint: '💨 Building steam — hold steady!',
  lostHint: '👆 Stay on the engine!',
} as const;
