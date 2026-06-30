/** Design tokens — OT Level 5 Session 5 · Game 4 · Lightning Jump */
export const LIGHTNING_JUMP_THEME = {
  storm: ['#1C1917', '#422006', '#713F12', '#A16207'] as const,
  grid: 'rgba(250,204,21,0.12)',
  node: 'rgba(250,204,21,0.25)',
  nodeActive: 'rgba(250,204,21,0.6)',
  bolt: '#FACC15',
  boltGlow: 'rgba(250,204,21,0.45)',
  dot: '#FDE047',
  dotCore: '#FEF9C3',
  dotGlow: 'rgba(250,204,21,0.55)',
  crack: 'rgba(255,255,255,0.08)',
  hudGlass: 'rgba(66,32,6,0.9)',
  hudBorder: 'rgba(250,204,21,0.4)',
  title: '#FEF9C3',
  subtitle: '#FDE047',
  accent: '#FACC15',
  accentDark: '#EAB308',
} as const;

export const LIGHTNING_JUMP_COPY = {
  title: 'Lightning Jump',
  emoji: '⚡',
  subtitle: 'Saccade Track · Visual Jumps',
  introDescription:
    'The energy dot teleports between lightning nodes! Snap your eyes to each new spot as fast as you can.',
  ttsIntro: 'Welcome to Lightning Jump! Snap your eyes to each new position!',
  ttsCue: 'Watch carefully! Track each jump with your eyes.',
  ttsTrack: 'Follow the dot when it jumps!',
  ttsComplete: 'Electrifying! Your saccade control is lightning fast!',
  congratsMessage: 'Lightning Eyes!',
  logType: 'jump-track',
  skillTags: ['saccades', 'visual-jump-control', 'eye-tracking'],
} as const;
