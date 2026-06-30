/** Design tokens — OT Level 5 Session 5 · Game 5 · Dual Focus */
export const DUAL_FOCUS_THEME = {
  stage: ['#111827', '#1F2937', '#374151', '#4B5563'] as const,
  splitLine: 'rgba(244,114,182,0.3)',
  zoneA: 'rgba(56,189,248,0.12)',
  zoneABorder: 'rgba(56,189,248,0.4)',
  zoneB: 'rgba(249,115,22,0.12)',
  zoneBBorder: 'rgba(249,115,22,0.4)',
  dotA: '#38BDF8',
  dotAGlow: 'rgba(56,189,248,0.5)',
  dotB: '#F97316',
  dotBGlow: 'rgba(249,115,22,0.5)',
  spotlight: 'rgba(255,255,255,0.06)',
  hudGlass: 'rgba(31,41,55,0.92)',
  hudBorder: 'rgba(244,114,182,0.4)',
  title: '#F9FAFB',
  subtitle: '#D1D5DB',
  accent: '#F472B6',
  accentDark: '#EC4899',
} as const;

export const DUAL_FOCUS_COPY = {
  title: 'Dual Focus',
  emoji: '⚫',
  subtitle: 'Alternating Dots · Focus Switch',
  introDescription:
    'Two dots take turns on the dual stage — blue glides horizontally, orange shifts vertically. Switch your eye focus to whichever is active!',
  ttsIntro: 'Welcome to Dual Focus! Switch your eyes between the two moving dots!',
  ttsCue: 'Watch carefully! Follow whichever dot is moving.',
  ttsTrack: 'Follow whichever dot is moving!',
  ttsComplete: 'Brilliant! You mastered alternating visual focus!',
  congratsMessage: 'Focus Switch Pro!',
  logType: 'multi-dot',
  skillTags: ['focus-switching', 'alternating-attention', 'eye-tracking'],
} as const;
