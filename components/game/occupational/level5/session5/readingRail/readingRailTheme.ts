/** Design tokens — OT Level 5 Session 5 · Game 1 · Reading Rail */
export const READING_RAIL_THEME = {
  sky: ['#0F172A', '#1E3A5F', '#1E40AF', '#312E81'] as const,
  shelf: '#1E293B',
  shelfLight: 'rgba(255,255,255,0.08)',
  bookSpine: ['#DC2626', '#2563EB', '#059669', '#D97706', '#7C3AED'],
  rail: 'rgba(56,189,248,0.45)',
  railGlow: 'rgba(56,189,248,0.2)',
  lamp: '#FDE68A',
  lampGlow: 'rgba(253,224,171,0.25)',
  dot: '#38BDF8',
  dotCore: '#E0F2FE',
  dotGlow: 'rgba(56,189,248,0.5)',
  hudGlass: 'rgba(15,23,42,0.88)',
  hudBorder: 'rgba(56,189,248,0.4)',
  title: '#BFDBFE',
  subtitle: '#93C5FD',
  accent: '#38BDF8',
  accentDark: '#0284C7',
} as const;

export const READING_RAIL_COPY = {
  title: 'Reading Rail',
  emoji: '👁️',
  subtitle: 'Side Track · Reading Readiness',
  introDescription:
    'A glowing pointer glides along the reading rail between book shelves. Follow it smoothly with your eyes — keep your head still!',
  ttsIntro: 'Welcome to Reading Rail! Follow the dot left and right with your eyes!',
  ttsCue: 'Watch carefully! Follow the dot with your eyes.',
  ttsTrack: 'Follow the dot with your eyes!',
  ttsComplete: 'Amazing! Your eyes are ready for reading!',
  congratsMessage: 'Eye Explorer!',
  logType: 'side-eye-track',
  skillTags: ['reading-readiness', 'eye-tracking', 'horizontal-tracking'],
} as const;
