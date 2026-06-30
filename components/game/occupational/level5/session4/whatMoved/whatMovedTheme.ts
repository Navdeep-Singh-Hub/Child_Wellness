/**
 * Design tokens — OT Level 5 Session 4 · Game 4 · What Moved?
 * Palette: detective desk amber + cork board evidence
 */

export const WHAT_MOVED_THEME = {
  desk: ['#422006', '#78350F', '#92400E', '#B45309'] as const,
  cork: '#A16207',
  corkDark: '#854D0E',
  corkGrain: 'rgba(120,53,15,0.35)',
  lampGlow: 'rgba(250,204,21,0.18)',
  lampBeam: 'rgba(254,243,199,0.08)',
  evidenceBg: 'rgba(255,255,255,0.94)',
  evidenceBorder: 'rgba(250,204,21,0.55)',
  evidenceShadow: 'rgba(66,32,6,0.3)',
  movedGlow: '#FACC15',
  movedRing: 'rgba(250,204,21,0.6)',
  correct: '#34D399',
  correctGlow: 'rgba(52,211,153,0.4)',
  wrong: '#F87171',
  wrongGlow: 'rgba(248,113,113,0.35)',
  hudGlass: 'rgba(66,32,6,0.9)',
  hudBorder: 'rgba(250,204,21,0.4)',
  title: '#FEF3C7',
  subtitle: '#FDE68A',
  accent: '#FACC15',
  accentDark: '#EAB308',
  magnifier: '#FEF9C3',
  pin: '#DC2626',
} as const;

export const WHAT_MOVED_COPY = {
  title: 'What Moved?',
  emoji: '🔍',
  subtitle: 'Detective Desk · Change Detection',
  introDescription:
    'Study the evidence board carefully. When the scene shifts, tap the object that changed position!',
  skills: ['Attention control', 'Visual tracking', 'Change detection', 'Spatial memory'],
  ttsIntro: 'Welcome detective! Memorize the scene, then spot what moved!',
  ttsCue: 'Watch carefully! Memorize where everything sits.',
  ttsReveal: 'Which object moved?',
  ttsCorrect: 'Case solved! You spotted the change!',
  ttsWrong: 'Not that one! Look for the moved object.',
  ttsComplete: 'Brilliant detective work! You solved every case!',
  congratsMessage: 'Super Sleuth!',
  logType: 'what-moved',
  skillTags: ['attention-control', 'visual-tracking', 'change-detection'],
  hintMemorize: '👀 Memorize the layout…',
  hintSpot: '🔍 Tap the object that moved!',
} as const;
