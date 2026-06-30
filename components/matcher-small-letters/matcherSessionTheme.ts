/** Design tokens — Matcher (Section 2) small-letters curriculum */

export const MATCHER_SESSION = {
  radius: { card: 24, button: 18, pill: 999 },
  shadow: {
    card: {
      shadowColor: '#0369A1',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 20,
      elevation: 6,
    },
    soft: {
      shadowColor: '#0C4A6E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3,
    },
  },
} as const;

/** Game 1 — Ocean Letter Lagoon (letter introduction) */
export const LETTER_LAGOON_THEME = {
  id: 'letter-lagoon',
  name: 'Ocean Letter Lagoon',
  mascot: '🐚',
  mascotName: 'Coral',
  gradient: ['#E0F7FA', '#B2EBF2', '#80DEEA', '#B3E5FC'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0284C7',
  accentSoft: '#38BDF8',
  accentDeep: '#0369A1',
  ink: '#0C4A6E',
  inkMuted: '#0369A1',
  bubble: 'rgba(255,255,255,0.92)',
  bubbleBorder: 'rgba(56, 189, 248, 0.55)',
  bubbleGlow: 'rgba(14, 165, 233, 0.25)',
  letterColor: '#0284C7',
  pearlActive: '#0EA5E9',
  pearlInactive: 'rgba(186, 230, 253, 0.8)',
  doneGradient: ['#38BDF8', '#0284C7', '#0369A1'] as const,
} as const;

/** Game 2 — Reef Letter Hunt (tap recognition) */
export const REEF_HUNT_THEME = {
  id: 'reef-hunt',
  name: 'Reef Letter Hunt',
  mascot: '🦑',
  mascotName: 'Inkwell',
  gradient: ['#F0FDFA', '#CCFBF1', '#99F6E4', '#5EEAD4'] as const,
  gradientLocations: [0, 0.3, 0.65, 1] as const,
  accent: '#0D9488',
  accentSoft: '#2DD4BF',
  accentDeep: '#0F766E',
  ink: '#134E4A',
  inkMuted: '#0F766E',
  treasure: '#F59E0B',
  treasureSoft: '#FDE68A',
  shell: 'rgba(255,255,255,0.94)',
  shellBorder: 'rgba(45, 212, 191, 0.5)',
  shellWrong: '#FCA5A5',
  shellCorrect: '#6EE7B7',
  targetCard: 'rgba(255, 255, 255, 0.9)',
  doneGradient: ['#2DD4BF', '#0D9488', '#0F766E'] as const,
} as const;

/** Game 3 — Driftwood Trace Bay (letter tracing + AI check) */
export const TRACE_BAY_THEME = {
  id: 'trace-bay',
  name: 'Driftwood Trace Bay',
  mascot: '🪼',
  mascotName: 'Glimmer',
  gradient: ['#FFFBEB', '#FEF3C7', '#BAE6FD', '#7DD3FC'] as const,
  gradientLocations: [0, 0.35, 0.75, 1] as const,
  accent: '#0369A1',
  accentSoft: '#38BDF8',
  accentDeep: '#0C4A6E',
  ink: '#1E3A5F',
  inkMuted: '#0369A1',
  sand: '#FFFBEB',
  sandBorder: '#FCD34D',
  slate: '#FFFFFF',
  slateBorder: '#93C5FD',
  guideGhost: 'rgba(3, 105, 161, 0.18)',
  inkStroke: '#0284C7',
  doneGradient: ['#38BDF8', '#0284C7', '#0369A1'] as const,
} as const;

/** Game 4 — Mirror Pearl Atelier (copy from model + AI check) */
export const COPY_PEARL_THEME = {
  id: 'copy-pearl',
  name: 'Mirror Pearl Atelier',
  mascot: '🪞',
  mascotName: 'Mirra',
  gradient: ['#FDF4FF', '#FCE7F3', '#E9D5FF', '#C4B5FD'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#5B21B6',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  pearl: '#FFFBFF',
  pearlBorder: '#E9D5FF',
  slate: '#FFFFFF',
  slateBorder: '#C4B5FD',
  modelGlow: 'rgba(167, 139, 250, 0.22)',
  mirror: '#EC4899',
  doneGradient: ['#C084FC', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Game 5 — Deep Sea Snapshot (real-world photo + AI validation) */
export const PHOTO_SNAPSHOT_THEME = {
  id: 'photo-snapshot',
  name: 'Deep Sea Snapshot',
  mascot: '📸',
  mascotName: 'Scuba Scan',
  gradient: ['#0C4A6E', '#155E75', '#0891B2', '#22D3EE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#22D3EE',
  accentSoft: '#67E8F9',
  accentDeep: '#0E7490',
  ink: '#F0FDFA',
  inkMuted: '#A5F3FC',
  inkDark: '#164E63',
  gold: '#FBBF24',
  goldSoft: '#FDE68A',
  frame: 'rgba(255,255,255,0.95)',
  frameBorder: 'rgba(103, 232, 249, 0.5)',
  doneGradient: ['#22D3EE', '#0891B2', '#0E7490'] as const,
  steps: ['Write on paper', 'Upload photo', 'AI verifies'] as const,
} as const;

/** Session hub & completion — Matcher voyage map */
export const MATCHER_HUB_THEME = {
  id: 'matcher-hub',
  name: 'Letter Reef Voyage',
  mascot: '🧭',
  mascotName: 'Captain Coral',
  gradient: ['#E0F7FA', '#BAE6FD', '#7DD3FC', '#38BDF8'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0284C7',
  accentDeep: '#0369A1',
  ink: '#0C4A6E',
  inkMuted: '#0369A1',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(56, 189, 248, 0.45)',
  doneGradient: ['#38BDF8', '#0284C7', '#0369A1'] as const,
} as const;

/** Quest card accents — one per game in the session arc */
export const MATCHER_QUESTS = [
  { step: 1, theme: LETTER_LAGOON_THEME, label: 'Lagoon Intro', desc: 'Meet and hear each lowercase letter' },
  { step: 2, theme: REEF_HUNT_THEME, label: 'Reef Hunt', desc: 'Find the letter hiding in the shells' },
  { step: 3, theme: TRACE_BAY_THEME, label: 'Trace Bay', desc: 'Trace thin strokes on the driftwood slate' },
  { step: 4, theme: COPY_PEARL_THEME, label: 'Pearl Copy', desc: 'Copy from the mirror model + AI check' },
  { step: 5, theme: PHOTO_SNAPSHOT_THEME, label: 'Deep Snapshot', desc: 'Write on paper and upload a photo' },
] as const;
