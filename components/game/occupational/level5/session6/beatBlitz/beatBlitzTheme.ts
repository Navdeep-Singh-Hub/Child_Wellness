/** Design tokens — OT Level 5 Session 6 · Game 5 · Beat Blitz */
export const BEAT_BLITZ_THEME = {
  sky: ['#3B0764', '#4C1D95', '#6B21A8', '#7E22CE'] as const,
  floor: 'rgba(192,132,252,0.15)',
  tile: ['#EC4899', '#8B5CF6', '#38BDF8', '#FACC15'],
  eq: '#C084FC',
  note: '#A855F7',
  noteGlow: 'rgba(168,85,247,0.5)',
  beatRing: 'rgba(192,132,252,0.35)',
  hudGlass: 'rgba(76,29,149,0.9)',
  hudBorder: 'rgba(192,132,252,0.4)',
  title: '#F3E8FF',
  subtitle: '#E9D5FF',
  accent: '#C084FC',
  accentDark: '#A855F7',
} as const;

export const BEAT_BLITZ_COPY = {
  title: 'Beat Blitz',
  emoji: '🎵',
  subtitle: 'Rhythm Stage · Auditory Sync',
  introDescription: 'Feel the beat pulse through the disco stage. Tap the glowing note exactly when it appears on the rhythm!',
  ttsIntro: 'Welcome to Beat Blitz! Tap on the beat!',
  ttsStart: 'Tap on the beat!',
  ttsSuccess: 'On beat!',
  ttsComplete: 'Fantastic! You nailed every rhythm beat!',
  congratsMessage: 'Rhythm Star!',
  logType: 'music-speed',
  skillTags: ['auditory-visual-sync', 'rhythm', 'timing'],
} as const;
