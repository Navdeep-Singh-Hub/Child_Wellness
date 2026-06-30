/** Design tokens — Grouper (Section 4) word-family curriculum */

export const GROUPER_SESSION = {
  radius: { card: 24, button: 18, pill: 999 },
  shadow: {
    card: {
      shadowColor: '#B45309',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 20,
      elevation: 6,
    },
    soft: {
      shadowColor: '#92400E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3,
    },
  },
} as const;

/** Session hub — Dune Den oasis */
export const GROUPER_HUB_THEME = {
  id: 'dune-den',
  name: 'Dune Den Oasis',
  mascot: '🦎',
  mascotName: 'Sage',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 191, 36, 0.45)',
  sunGlow: 'rgba(251, 191, 36, 0.35)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 1 · Game 1 — AT Word Scout (find -AT words) */
export const AT_FINDER_THEME = {
  id: 'at-finder',
  name: 'AT Word Scout',
  mascot: '🔍',
  mascotName: 'Scout',
  gradient: ['#FFFBEB', '#FEF3C7', '#FFEDD5', '#FED7AA'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#EA580C',
  accentSoft: '#FB923C',
  accentDeep: '#C2410C',
  ink: '#7C2D12',
  inkMuted: '#9A3412',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 146, 60, 0.45)',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(234, 88, 12, 0.4)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  targetGlow: 'rgba(254, 215, 170, 0.55)',
  doneGradient: ['#FB923C', '#EA580C', '#C2410C'] as const,
} as const;

/** Session 1 · Game 2 — Rhyme Dune Echo (cat → bat) */
export const AT_RHYME_THEME = {
  id: 'at-rhyme',
  name: 'Rhyme Dune Echo',
  mascot: '🎵',
  mascotName: 'Echo',
  gradient: ['#FFF7ED', '#FFEDD5', '#FEF9C3', '#FDE68A'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#CA8A04',
  accentSoft: '#FACC15',
  accentDeep: '#A16207',
  ink: '#713F12',
  inkMuted: '#854D0E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(250, 204, 21, 0.45)',
  promptGlow: 'rgba(254, 243, 199, 0.7)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  doneGradient: ['#FACC15', '#CA8A04', '#A16207'] as const,
} as const;

/** Session 1 · Game 3 — Clap Canyon Beat (syllables) */
export const AT_CLAP_THEME = {
  id: 'at-clap',
  name: 'Clap Canyon Beat',
  mascot: '👏',
  mascotName: 'Beat',
  gradient: ['#FEFCE8', '#FEF9C3', '#FFFBEB', '#FEF3C7'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#EAB308',
  accentSoft: '#FDE047',
  accentDeep: '#CA8A04',
  ink: '#713F12',
  inkMuted: '#854D0E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(234, 179, 8, 0.4)',
  clapBtn: '#FEF08A',
  clapBorder: '#EAB308',
  doneGradient: ['#FDE047', '#EAB308', '#CA8A04'] as const,
} as const;

/** Session 1 · Game 4 — Basket Bazaar Sort (categories) */
export const AT_SORT_THEME = {
  id: 'at-sort',
  name: 'Basket Bazaar Sort',
  mascot: '🧺',
  mascotName: 'Bazaar',
  gradient: ['#FFFBEB', '#FEF3C7', '#FEE2E2', '#FECACA'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#DC2626',
  accentSoft: '#F87171',
  accentDeep: '#B91C1C',
  ink: '#7F1D1D',
  inkMuted: '#991B1B',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(248, 113, 113, 0.4)',
  basket: 'rgba(254, 243, 199, 0.85)',
  basketBorder: 'rgba(217, 119, 6, 0.45)',
  cardBorder: 'rgba(234, 88, 12, 0.45)',
  doneGradient: ['#F87171', '#DC2626', '#B91C1C'] as const,
} as const;

/** Session 1 · Task 5 — Scribe's Scroll (notebook photo + AI) */
export const AT_NOTEBOOK_THEME = {
  id: 'at-notebook',
  name: "Scribe's Scroll",
  mascot: '📜',
  mascotName: 'Scribe',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FBBF24'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#B45309',
  accentSoft: '#FBBF24',
  accentDeep: '#92400E',
  ink: '#78350F',
  inkMuted: '#92400E',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 191, 36, 0.45)',
  frame: 'rgba(255,255,255,0.98)',
  frameBorder: 'rgba(180, 83, 9, 0.4)',
  gold: '#FBBF24',
  goldSoft: '#FDE68A',
  doneGradient: ['#FBBF24', '#B45309', '#92400E'] as const,
  steps: ['Write 3 -AT words', 'Draw each word', 'Snap photo', 'AI checks'] as const,
} as const;

/** Session 1 quest cards */
export const GROUPER_S1_QUESTS = [
  { step: 1, theme: AT_FINDER_THEME, label: 'AT Word Scout', desc: 'Tap all the -AT family words' },
  { step: 2, theme: AT_RHYME_THEME, label: 'Rhyme Echo', desc: 'Find the word that rhymes with cat' },
  { step: 3, theme: AT_CLAP_THEME, label: 'Clap Beat', desc: 'Clap once for each -AT word' },
  { step: 4, theme: AT_SORT_THEME, label: 'Basket Sort', desc: 'Sort cat, rat, hat, and bat into baskets' },
  { step: 5, theme: AT_NOTEBOOK_THEME, label: "Scribe's Scroll", desc: 'Write and draw 3 -AT words, then upload a photo' },
] as const;

/** Session 2 hub — Canyon Cove */
export const GROUPER_S2_HUB_THEME = {
  id: 'canyon-cove',
  name: 'Canyon Cove',
  mascot: '🦅',
  mascotName: 'Cliff',
  gradient: ['#FFF1F2', '#FECDD3', '#FED7AA', '#FB923C'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#E11D48',
  accentSoft: '#FB7185',
  accentDeep: '#BE123C',
  ink: '#881337',
  inkMuted: '#9F1239',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 113, 133, 0.45)',
  sunGlow: 'rgba(251, 113, 133, 0.3)',
  doneGradient: ['#FB7185', '#E11D48', '#BE123C'] as const,
} as const;

/** Session 2 · Game 1 — IN Word Canyon Scout */
export const IN_FINDER_THEME = {
  id: 'in-finder',
  name: 'IN Word Canyon Scout',
  mascot: '🔍',
  mascotName: 'Scout',
  gradient: ['#FFF1F2', '#FFE4E6', '#FFEDD5', '#FED7AA'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#E11D48',
  accentSoft: '#FB7185',
  accentDeep: '#BE123C',
  ink: '#881337',
  inkMuted: '#9F1239',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 113, 133, 0.45)',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(225, 29, 72, 0.4)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  targetGlow: 'rgba(254, 205, 211, 0.55)',
  doneGradient: ['#FB7185', '#E11D48', '#BE123C'] as const,
} as const;

/** Session 2 · Game 2 — Pin Rhyme Echo */
export const IN_RHYME_THEME = {
  id: 'in-rhyme',
  name: 'Pin Rhyme Echo',
  mascot: '🎵',
  mascotName: 'Echo',
  gradient: ['#FAF5FF', '#F3E8FF', '#FFE4E6', '#FECDD3'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#A21CAF',
  accentSoft: '#E879F9',
  accentDeep: '#86198F',
  ink: '#701A75',
  inkMuted: '#86198F',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(232, 121, 249, 0.45)',
  promptGlow: 'rgba(243, 232, 255, 0.75)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  doneGradient: ['#E879F9', '#A21CAF', '#86198F'] as const,
} as const;

/** Session 2 · Game 3 — Canyon Clap Rhythm */
export const IN_CLAP_THEME = {
  id: 'in-clap',
  name: 'Canyon Clap Rhythm',
  mascot: '👏',
  mascotName: 'Rhythm',
  gradient: ['#FFF7ED', '#FFEDD5', '#FFE4E6', '#FECDD3'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#EA580C',
  accentSoft: '#FB923C',
  accentDeep: '#C2410C',
  ink: '#7C2D12',
  inkMuted: '#9A3412',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 146, 60, 0.4)',
  clapBtn: '#FFEDD5',
  clapBorder: '#FB923C',
  doneGradient: ['#FB923C', '#EA580C', '#C2410C'] as const,
} as const;

/** Session 2 · Game 4 — Cove Sort Station */
export const IN_SORT_THEME = {
  id: 'in-sort',
  name: 'Cove Sort Station',
  mascot: '🧺',
  mascotName: 'Sorter',
  gradient: ['#F0FDFA', '#CCFBF1', '#FFE4E6', '#FECDD3'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0D9488',
  accentSoft: '#2DD4BF',
  accentDeep: '#0F766E',
  ink: '#134E4A',
  inkMuted: '#115E59',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(45, 212, 191, 0.4)',
  basket: 'rgba(204, 251, 241, 0.85)',
  basketBorder: 'rgba(13, 148, 136, 0.45)',
  cardBorder: 'rgba(225, 29, 72, 0.4)',
  doneGradient: ['#2DD4BF', '#0D9488', '#0F766E'] as const,
} as const;

/** Session 2 · Task 5 — Canyon Scroll Journal */
export const IN_NOTEBOOK_THEME = {
  id: 'in-notebook',
  name: 'Canyon Scroll Journal',
  mascot: '📓',
  mascotName: 'Journal',
  gradient: ['#FFF1F2', '#FECDD3', '#FED7AA', '#FB923C'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#BE123C',
  accentSoft: '#FB7185',
  accentDeep: '#9F1239',
  ink: '#881337',
  inkMuted: '#9F1239',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 113, 133, 0.45)',
  frame: 'rgba(255,255,255,0.98)',
  frameBorder: 'rgba(190, 18, 60, 0.4)',
  gold: '#FB7185',
  goldSoft: '#FECDD3',
  doneGradient: ['#FB7185', '#BE123C', '#9F1239'] as const,
  steps: ['Write 3 -IN words', 'Draw each word', 'Snap photo', 'AI checks'] as const,
} as const;

/** Session 2 quest cards */
export const GROUPER_S2_QUESTS = [
  { step: 1, theme: IN_FINDER_THEME, label: 'IN Word Scout', desc: 'Tap all the -IN family words' },
  { step: 2, theme: IN_RHYME_THEME, label: 'Pin Rhyme Echo', desc: 'Find the word that rhymes with pin' },
  { step: 3, theme: IN_CLAP_THEME, label: 'Canyon Clap', desc: 'Clap once for pin, tin, and bin' },
  { step: 4, theme: IN_SORT_THEME, label: 'Cove Sort', desc: 'Sort containers and animals' },
  { step: 5, theme: IN_NOTEBOOK_THEME, label: 'Canyon Journal', desc: 'Write and draw 3 -IN words, then upload a photo' },
] as const;

/** Session 3 hub — Mirage Mesa */
export const GROUPER_S3_HUB_THEME = {
  id: 'mirage-mesa',
  name: 'Mirage Mesa',
  mascot: '🌅',
  mascotName: 'Shimmer',
  gradient: ['#ECFEFF', '#CFFAFE', '#FEF9C3', '#FDE047'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0891B2',
  accentSoft: '#22D3EE',
  accentDeep: '#0E7490',
  ink: '#164E63',
  inkMuted: '#155E75',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(34, 211, 238, 0.45)',
  sunGlow: 'rgba(254, 240, 138, 0.35)',
  doneGradient: ['#22D3EE', '#0891B2', '#0E7490'] as const,
} as const;

/** Session 3 · Game 1 — UN Word Mirage Scout */
export const UN_FINDER_THEME = {
  id: 'un-finder',
  name: 'UN Word Mirage Scout',
  mascot: '🔍',
  mascotName: 'Scout',
  gradient: ['#ECFEFF', '#CFFAFE', '#FEF9C3', '#FDE68A'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0891B2',
  accentSoft: '#22D3EE',
  accentDeep: '#0E7490',
  ink: '#164E63',
  inkMuted: '#155E75',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(34, 211, 238, 0.45)',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(8, 145, 178, 0.4)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  targetGlow: 'rgba(207, 250, 254, 0.65)',
  doneGradient: ['#22D3EE', '#0891B2', '#0E7490'] as const,
} as const;

/** Session 3 · Game 2 — Sun Rhyme Mirage */
export const UN_RHYME_THEME = {
  id: 'un-rhyme',
  name: 'Sun Rhyme Mirage',
  mascot: '🎵',
  mascotName: 'Echo',
  gradient: ['#F5F3FF', '#EDE9FE', '#CFFAFE', '#A5F3FC'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(167, 139, 250, 0.45)',
  promptGlow: 'rgba(237, 233, 254, 0.75)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 3 · Game 3 — Mirage Clap Pulse */
export const UN_CLAP_THEME = {
  id: 'un-clap',
  name: 'Mirage Clap Pulse',
  mascot: '👏',
  mascotName: 'Pulse',
  gradient: ['#FFFBEB', '#FEF9C3', '#CFFAFE', '#A5F3FC'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#CA8A04',
  accentSoft: '#FACC15',
  accentDeep: '#A16207',
  ink: '#713F12',
  inkMuted: '#854D0E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(250, 204, 21, 0.45)',
  clapBtn: '#FEF08A',
  clapBorder: '#EAB308',
  doneGradient: ['#FACC15', '#CA8A04', '#A16207'] as const,
} as const;

/** Session 3 · Game 4 — Mesa Sort Oasis */
export const UN_SORT_THEME = {
  id: 'un-sort',
  name: 'Mesa Sort Oasis',
  mascot: '🧺',
  mascotName: 'Sorter',
  gradient: ['#FFFBEB', '#FEF9C3', '#ECFEFF', '#CFFAFE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0284C7',
  accentSoft: '#38BDF8',
  accentDeep: '#0369A1',
  ink: '#0C4A6E',
  inkMuted: '#0369A1',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(56, 189, 248, 0.4)',
  basket: 'rgba(224, 242, 254, 0.85)',
  basketBorder: 'rgba(2, 132, 199, 0.45)',
  cardBorder: 'rgba(8, 145, 178, 0.4)',
  doneGradient: ['#38BDF8', '#0284C7', '#0369A1'] as const,
} as const;

/** Session 3 · Task 5 — Mirage Sketch Journal */
export const UN_NOTEBOOK_THEME = {
  id: 'un-notebook',
  name: 'Mirage Sketch Journal',
  mascot: '📓',
  mascotName: 'Sketch',
  gradient: ['#ECFEFF', '#CFFAFE', '#FEF9C3', '#FDE047'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0E7490',
  accentSoft: '#22D3EE',
  accentDeep: '#155E75',
  ink: '#164E63',
  inkMuted: '#155E75',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(34, 211, 238, 0.45)',
  frame: 'rgba(255,255,255,0.98)',
  frameBorder: 'rgba(14, 116, 144, 0.4)',
  gold: '#22D3EE',
  goldSoft: '#CFFAFE',
  doneGradient: ['#22D3EE', '#0E7490', '#155E75'] as const,
  steps: ['Draw 3 -UN words', 'Write each word', 'Snap photo', 'AI checks'] as const,
} as const;

/** Session 3 quest cards */
export const GROUPER_S3_QUESTS = [
  { step: 1, theme: UN_FINDER_THEME, label: 'UN Word Scout', desc: 'Tap all the -UN family words' },
  { step: 2, theme: UN_RHYME_THEME, label: 'Sun Rhyme Mirage', desc: 'Find the word that rhymes with sun' },
  { step: 3, theme: UN_CLAP_THEME, label: 'Mirage Clap', desc: 'Clap once for sun, run, and bun' },
  { step: 4, theme: UN_SORT_THEME, label: 'Mesa Sort', desc: 'Sort outdoor words and food words' },
  { step: 5, theme: UN_NOTEBOOK_THEME, label: 'Mirage Journal', desc: 'Draw and write 3 -UN words, then upload a photo' },
] as const;

/** Session 4 hub — Oasis Orchard */
export const GROUPER_S4_HUB_THEME = {
  id: 'oasis-orchard',
  name: 'Oasis Orchard',
  mascot: '🌴',
  mascotName: 'Grove',
  gradient: ['#ECFDF5', '#D1FAE5', '#FEF9C3', '#FDE68A'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#16A34A',
  accentSoft: '#4ADE80',
  accentDeep: '#15803D',
  ink: '#14532D',
  inkMuted: '#166534',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(74, 222, 128, 0.45)',
  sunGlow: 'rgba(250, 204, 21, 0.3)',
  doneGradient: ['#4ADE80', '#16A34A', '#15803D'] as const,
} as const;

/** Session 4 · Game 1 — Family Sort Grove */
export const MIXED_FAMILY_SORT_THEME = {
  id: 'mixed-family-sort',
  name: 'Family Sort Grove',
  mascot: '🧺',
  mascotName: 'Sorter',
  gradient: ['#ECFDF5', '#D1FAE5', '#FFFBEB', '#FEF3C7'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#16A34A',
  accentSoft: '#4ADE80',
  accentDeep: '#15803D',
  ink: '#14532D',
  inkMuted: '#166534',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(74, 222, 128, 0.45)',
  wordCard: 'rgba(255,255,255,0.95)',
  wordBorder: 'rgba(22, 163, 74, 0.4)',
  box: 'rgba(236, 253, 245, 0.9)',
  boxBorder: 'rgba(22, 163, 74, 0.45)',
  doneGradient: ['#4ADE80', '#16A34A', '#15803D'] as const,
} as const;

/** Session 4 · Game 2 — Rhyme Pair Orchard */
export const MIXED_RHYME_PAIRS_THEME = {
  id: 'mixed-rhyme-pairs',
  name: 'Rhyme Pair Orchard',
  mascot: '🎵',
  mascotName: 'Harmony',
  gradient: ['#F0FDF4', '#DCFCE7', '#F5F3FF', '#EDE9FE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(167, 139, 250, 0.45)',
  promptGlow: 'rgba(237, 233, 254, 0.75)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 4 · Game 3 — Syllable Clap Grove */
export const MIXED_SYLLABLE_CLAP_THEME = {
  id: 'mixed-syllable-clap',
  name: 'Syllable Clap Grove',
  mascot: '👏',
  mascotName: 'Beat',
  gradient: ['#FFFBEB', '#FEF9C3', '#ECFDF5', '#D1FAE5'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#CA8A04',
  accentSoft: '#FACC15',
  accentDeep: '#A16207',
  ink: '#713F12',
  inkMuted: '#854D0E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(250, 204, 21, 0.45)',
  clapBtn: '#FEF08A',
  clapBorder: '#EAB308',
  doneGradient: ['#FACC15', '#CA8A04', '#A16207'] as const,
} as const;

/** Session 4 · Game 4 — Shape Sort Oasis */
export const MIXED_SHAPE_SORT_THEME = {
  id: 'mixed-shape-sort',
  name: 'Shape Sort Oasis',
  mascot: '🔺',
  mascotName: 'Geo',
  gradient: ['#EFF6FF', '#DBEAFE', '#ECFDF5', '#D1FAE5'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#2563EB',
  accentSoft: '#60A5FA',
  accentDeep: '#1D4ED8',
  ink: '#1E3A8A',
  inkMuted: '#1D4ED8',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(96, 165, 250, 0.45)',
  basket: 'rgba(224, 242, 254, 0.85)',
  basketBorder: 'rgba(37, 99, 235, 0.45)',
  cardBorder: 'rgba(37, 99, 235, 0.4)',
  doneGradient: ['#60A5FA', '#2563EB', '#1D4ED8'] as const,
} as const;

/** Session 4 · Task 5 — Mixed Family Journal */
export const MIXED_NOTEBOOK_THEME = {
  id: 'mixed-notebook',
  name: 'Mixed Family Journal',
  mascot: '📓',
  mascotName: 'Scribe',
  gradient: ['#ECFDF5', '#D1FAE5', '#FEF9C3', '#FDE68A'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#15803D',
  accentSoft: '#4ADE80',
  accentDeep: '#14532D',
  ink: '#14532D',
  inkMuted: '#166534',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(74, 222, 128, 0.45)',
  frame: 'rgba(255,255,255,0.98)',
  frameBorder: 'rgba(21, 128, 61, 0.4)',
  gold: '#4ADE80',
  goldSoft: '#BBF7D0',
  doneGradient: ['#4ADE80', '#15803D', '#14532D'] as const,
  steps: ['Write -at word', 'Write -in word', 'Write -un word', 'Snap photo'] as const,
} as const;

/** Session 4 quest cards */
export const GROUPER_S4_QUESTS = [
  { step: 1, theme: MIXED_FAMILY_SORT_THEME, label: 'Family Sort', desc: 'Sort cat, hat, pin, tin, sun, bun into -at, -in, -un' },
  { step: 2, theme: MIXED_RHYME_PAIRS_THEME, label: 'Rhyme Pairs', desc: 'Match rhymes: cat→hat, pin→tin, sun→bun' },
  { step: 3, theme: MIXED_SYLLABLE_CLAP_THEME, label: 'Syllable Clap', desc: 'Clap twice for rabbit, tiger, and monkey' },
  { step: 4, theme: MIXED_SHAPE_SORT_THEME, label: 'Shape Sort', desc: 'Sort circles, squares, and triangles' },
  { step: 5, theme: MIXED_NOTEBOOK_THEME, label: 'Mixed Journal', desc: 'Write one word from each family, then upload a photo' },
] as const;

/** Session 5 hub — Sandstone Shelf */
export const GROUPER_S5_HUB_THEME = {
  id: 'sandstone-shelf',
  name: 'Sandstone Shelf',
  mascot: '🪣',
  mascotName: 'Sandy',
  gradient: ['#FFFBEB', '#FEF3C7', '#FFEDD5', '#FED7AA'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 191, 36, 0.45)',
  sunGlow: 'rgba(254, 215, 170, 0.35)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 5 · Game 1 — OP Word Shelf Scout */
export const OP_FINDER_THEME = {
  id: 'op-finder',
  name: 'OP Word Shelf Scout',
  mascot: '🔍',
  mascotName: 'Scout',
  gradient: ['#FFFBEB', '#FEF3C7', '#FFEDD5', '#FDE68A'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 191, 36, 0.45)',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(217, 119, 6, 0.4)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  targetGlow: 'rgba(254, 243, 199, 0.75)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 5 · Game 2 — Top Rhyme Ridge */
export const OP_RHYME_THEME = {
  id: 'op-rhyme',
  name: 'Top Rhyme Ridge',
  mascot: '🎵',
  mascotName: 'Echo',
  gradient: ['#FFFBEB', '#FEF3C7', '#F5F3FF', '#EDE9FE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(167, 139, 250, 0.45)',
  promptGlow: 'rgba(254, 243, 199, 0.75)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 5 · Game 3 — Shelf Clap Echo */
export const OP_CLAP_THEME = {
  id: 'op-clap',
  name: 'Shelf Clap Echo',
  mascot: '👏',
  mascotName: 'Beat',
  gradient: ['#FFFBEB', '#FEF9C3', '#FFEDD5', '#FED7AA'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#CA8A04',
  accentSoft: '#FACC15',
  accentDeep: '#A16207',
  ink: '#713F12',
  inkMuted: '#854D0E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(250, 204, 21, 0.45)',
  clapBtn: '#FEF08A',
  clapBorder: '#EAB308',
  doneGradient: ['#FACC15', '#CA8A04', '#A16207'] as const,
} as const;

/** Session 5 · Game 4 — Shelf Sort Nook */
export const OP_SORT_THEME = {
  id: 'op-sort',
  name: 'Shelf Sort Nook',
  mascot: '🧹',
  mascotName: 'Sorter',
  gradient: ['#FFFBEB', '#FEF3C7', '#EFF6FF', '#DBEAFE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#2563EB',
  accentSoft: '#60A5FA',
  accentDeep: '#1D4ED8',
  ink: '#1E3A8A',
  inkMuted: '#1D4ED8',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(96, 165, 250, 0.45)',
  basket: 'rgba(224, 242, 254, 0.85)',
  basketBorder: 'rgba(37, 99, 235, 0.45)',
  cardBorder: 'rgba(37, 99, 235, 0.4)',
  doneGradient: ['#60A5FA', '#2563EB', '#1D4ED8'] as const,
} as const;

/** Session 5 · Task 5 — Sandstone Journal */
export const OP_NOTEBOOK_THEME = {
  id: 'op-notebook',
  name: 'Sandstone Journal',
  mascot: '📓',
  mascotName: 'Scribe',
  gradient: ['#FFFBEB', '#FEF3C7', '#FFEDD5', '#FED7AA'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#B45309',
  accentSoft: '#FBBF24',
  accentDeep: '#78350F',
  ink: '#78350F',
  inkMuted: '#92400E',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 191, 36, 0.45)',
  frame: 'rgba(255,255,255,0.98)',
  frameBorder: 'rgba(180, 83, 9, 0.4)',
  gold: '#FBBF24',
  goldSoft: '#FEF3C7',
  doneGradient: ['#FBBF24', '#B45309', '#78350F'] as const,
  steps: ['Write top', 'Write mop', 'Write hop', 'Snap photo'] as const,
} as const;

/** Session 5 quest cards */
export const GROUPER_S5_QUESTS = [
  { step: 1, theme: OP_FINDER_THEME, label: 'OP Word Scout', desc: 'Tap all the -OP family words' },
  { step: 2, theme: OP_RHYME_THEME, label: 'Top Rhyme', desc: 'Find the word that rhymes with top' },
  { step: 3, theme: OP_CLAP_THEME, label: 'Shelf Clap', desc: 'Clap once for mop and hop' },
  { step: 4, theme: OP_SORT_THEME, label: 'Shelf Sort', desc: 'Sort cleaning tools and toys' },
  { step: 5, theme: OP_NOTEBOOK_THEME, label: 'Sandstone Journal', desc: 'Draw and write top, mop, hop, then upload a photo' },
] as const;

/** Session 6 hub — Terracotta Trail */
export const GROUPER_S6_HUB_THEME = {
  id: 'terracotta-trail',
  name: 'Terracotta Trail',
  mascot: '🥫',
  mascotName: 'Terra',
  gradient: ['#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#EA580C',
  accentSoft: '#FB923C',
  accentDeep: '#C2410C',
  ink: '#7C2D12',
  inkMuted: '#9A3412',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 146, 60, 0.45)',
  sunGlow: 'rgba(253, 186, 116, 0.35)',
  doneGradient: ['#FB923C', '#EA580C', '#C2410C'] as const,
} as const;

/** Session 6 · Game 1 — AN Word Trail Scout */
export const AN_FINDER_THEME = {
  id: 'an-finder',
  name: 'AN Word Trail Scout',
  mascot: '🔍',
  mascotName: 'Scout',
  gradient: ['#FFF7ED', '#FFEDD5', '#FED7AA', '#FDE68A'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#EA580C',
  accentSoft: '#FB923C',
  accentDeep: '#C2410C',
  ink: '#7C2D12',
  inkMuted: '#9A3412',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 146, 60, 0.45)',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(234, 88, 12, 0.4)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  targetGlow: 'rgba(255, 237, 213, 0.75)',
  doneGradient: ['#FB923C', '#EA580C', '#C2410C'] as const,
} as const;

/** Session 6 · Game 2 — Fan Rhyme Path */
export const AN_RHYME_THEME = {
  id: 'an-rhyme',
  name: 'Fan Rhyme Path',
  mascot: '🎵',
  mascotName: 'Echo',
  gradient: ['#FFF7ED', '#FFEDD5', '#F5F3FF', '#EDE9FE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(167, 139, 250, 0.45)',
  promptGlow: 'rgba(255, 237, 213, 0.75)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 6 · Game 3 — Trail Clap Echo */
export const AN_CLAP_THEME = {
  id: 'an-clap',
  name: 'Trail Clap Echo',
  mascot: '👏',
  mascotName: 'Beat',
  gradient: ['#FFFBEB', '#FEF9C3', '#FFEDD5', '#FED7AA'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#CA8A04',
  accentSoft: '#FACC15',
  accentDeep: '#A16207',
  ink: '#713F12',
  inkMuted: '#854D0E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(250, 204, 21, 0.45)',
  clapBtn: '#FEF08A',
  clapBorder: '#EAB308',
  doneGradient: ['#FACC15', '#CA8A04', '#A16207'] as const,
} as const;

/** Session 6 · Game 4 — Trail Sort Nook */
export const AN_SORT_THEME = {
  id: 'an-sort',
  name: 'Trail Sort Nook',
  mascot: '🍳',
  mascotName: 'Sorter',
  gradient: ['#FFF7ED', '#FFEDD5', '#EFF6FF', '#DBEAFE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#2563EB',
  accentSoft: '#60A5FA',
  accentDeep: '#1D4ED8',
  ink: '#1E3A8A',
  inkMuted: '#1D4ED8',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(96, 165, 250, 0.45)',
  basket: 'rgba(224, 242, 254, 0.85)',
  basketBorder: 'rgba(37, 99, 235, 0.45)',
  cardBorder: 'rgba(37, 99, 235, 0.4)',
  doneGradient: ['#60A5FA', '#2563EB', '#1D4ED8'] as const,
} as const;

/** Session 6 · Task 5 — Terracotta Journal */
export const AN_NOTEBOOK_THEME = {
  id: 'an-notebook',
  name: 'Terracotta Journal',
  mascot: '📓',
  mascotName: 'Scribe',
  gradient: ['#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#C2410C',
  accentSoft: '#FB923C',
  accentDeep: '#7C2D12',
  ink: '#7C2D12',
  inkMuted: '#9A3412',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 146, 60, 0.45)',
  frame: 'rgba(255,255,255,0.98)',
  frameBorder: 'rgba(194, 65, 12, 0.4)',
  gold: '#FB923C',
  goldSoft: '#FFEDD5',
  doneGradient: ['#FB923C', '#C2410C', '#7C2D12'] as const,
  steps: ['Write fan', 'Write man', 'Write pan', 'Snap photo'] as const,
} as const;

/** Session 6 quest cards */
export const GROUPER_S6_QUESTS = [
  { step: 1, theme: AN_FINDER_THEME, label: 'AN Word Scout', desc: 'Tap all the -AN family words' },
  { step: 2, theme: AN_RHYME_THEME, label: 'Fan Rhyme', desc: 'Find the word that rhymes with fan' },
  { step: 3, theme: AN_CLAP_THEME, label: 'Trail Clap', desc: 'Clap once for fan and man' },
  { step: 4, theme: AN_SORT_THEME, label: 'Trail Sort', desc: 'Sort kitchen items and people' },
  { step: 5, theme: AN_NOTEBOOK_THEME, label: 'Terracotta Journal', desc: 'Write fan, man, pan, then upload a photo' },
] as const;

/** Session 7 hub — Sunset Shelf */
export const GROUPER_S7_HUB_THEME = {
  id: 'sunset-shelf',
  name: 'Sunset Shelf',
  mascot: '🐾',
  mascotName: 'Paws',
  gradient: ['#FFF1F2', '#FECDD3', '#FDE68A', '#FDBA74'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#E11D48',
  accentSoft: '#FB7185',
  accentDeep: '#BE123C',
  ink: '#881337',
  inkMuted: '#9F1239',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 113, 133, 0.45)',
  sunGlow: 'rgba(253, 224, 71, 0.35)',
  doneGradient: ['#FB7185', '#E11D48', '#BE123C'] as const,
} as const;

/** Session 7 · Game 1 — ET Word Sunset Scout */
export const ET_FINDER_THEME = {
  id: 'et-finder',
  name: 'ET Word Sunset Scout',
  mascot: '🔍',
  mascotName: 'Scout',
  gradient: ['#FFF1F2', '#FECDD3', '#FEF9C3', '#FDE68A'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#E11D48',
  accentSoft: '#FB7185',
  accentDeep: '#BE123C',
  ink: '#881337',
  inkMuted: '#9F1239',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 113, 133, 0.45)',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(225, 29, 72, 0.4)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  targetGlow: 'rgba(254, 205, 211, 0.75)',
  doneGradient: ['#FB7185', '#E11D48', '#BE123C'] as const,
} as const;

/** Session 7 · Game 2 — Pet Rhyme Glow */
export const ET_RHYME_THEME = {
  id: 'et-rhyme',
  name: 'Pet Rhyme Glow',
  mascot: '🎵',
  mascotName: 'Echo',
  gradient: ['#FFF1F2', '#FECDD3', '#F5F3FF', '#EDE9FE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(167, 139, 250, 0.45)',
  promptGlow: 'rgba(254, 205, 211, 0.75)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 7 · Game 3 — Sunset Clap Beat */
export const ET_CLAP_THEME = {
  id: 'et-clap',
  name: 'Sunset Clap Beat',
  mascot: '👏',
  mascotName: 'Beat',
  gradient: ['#FFFBEB', '#FEF9C3', '#FFF1F2', '#FECDD3'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#CA8A04',
  accentSoft: '#FACC15',
  accentDeep: '#A16207',
  ink: '#713F12',
  inkMuted: '#854D0E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(250, 204, 21, 0.45)',
  clapBtn: '#FEF08A',
  clapBorder: '#EAB308',
  doneGradient: ['#FACC15', '#CA8A04', '#A16207'] as const,
} as const;

/** Session 7 · Game 4 — Sunset Sort Den */
export const ET_SORT_THEME = {
  id: 'et-sort',
  name: 'Sunset Sort Den',
  mascot: '🐾',
  mascotName: 'Sorter',
  gradient: ['#FFF1F2', '#FECDD3', '#EFF6FF', '#DBEAFE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#2563EB',
  accentSoft: '#60A5FA',
  accentDeep: '#1D4ED8',
  ink: '#1E3A8A',
  inkMuted: '#1D4ED8',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(96, 165, 250, 0.45)',
  basket: 'rgba(224, 242, 254, 0.85)',
  basketBorder: 'rgba(37, 99, 235, 0.45)',
  cardBorder: 'rgba(37, 99, 235, 0.4)',
  doneGradient: ['#60A5FA', '#2563EB', '#1D4ED8'] as const,
} as const;

/** Session 7 · Task 5 — Sunset Journal */
export const ET_NOTEBOOK_THEME = {
  id: 'et-notebook',
  name: 'Sunset Journal',
  mascot: '📓',
  mascotName: 'Scribe',
  gradient: ['#FFF1F2', '#FECDD3', '#FEF9C3', '#FDE68A'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#BE123C',
  accentSoft: '#FB7185',
  accentDeep: '#881337',
  ink: '#881337',
  inkMuted: '#9F1239',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 113, 133, 0.45)',
  frame: 'rgba(255,255,255,0.98)',
  frameBorder: 'rgba(190, 18, 60, 0.4)',
  gold: '#FB7185',
  goldSoft: '#FECDD3',
  doneGradient: ['#FB7185', '#BE123C', '#881337'] as const,
  steps: ['Write pet', 'Write jet', 'Snap photo'] as const,
} as const;

/** Session 7 quest cards */
export const GROUPER_S7_QUESTS = [
  { step: 1, theme: ET_FINDER_THEME, label: 'ET Word Scout', desc: 'Tap all the -ET family words' },
  { step: 2, theme: ET_RHYME_THEME, label: 'Pet Rhyme', desc: 'Find the word that rhymes with pet' },
  { step: 3, theme: ET_CLAP_THEME, label: 'Sunset Clap', desc: 'Clap once for pet and jet' },
  { step: 4, theme: ET_SORT_THEME, label: 'Sunset Sort', desc: 'Sort animals and vehicles' },
  { step: 5, theme: ET_NOTEBOOK_THEME, label: 'Sunset Journal', desc: 'Draw and write pet and jet, then upload a photo' },
] as const;

/** Session 8 hub — Golden Gulch */
export const GROUPER_S8_HUB_THEME = {
  id: 'golden-gulch',
  name: 'Golden Gulch',
  mascot: '🐷',
  mascotName: 'Goldie',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 191, 36, 0.45)',
  sunGlow: 'rgba(252, 211, 77, 0.4)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 8 · Game 1 — IG Word Gulch Scout */
export const IG_FINDER_THEME = {
  id: 'ig-finder',
  name: 'IG Word Gulch Scout',
  mascot: '🔍',
  mascotName: 'Scout',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 191, 36, 0.45)',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(217, 119, 6, 0.4)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  targetGlow: 'rgba(254, 243, 199, 0.75)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 8 · Game 2 — Pig Rhyme Gulch */
export const IG_RHYME_THEME = {
  id: 'ig-rhyme',
  name: 'Pig Rhyme Gulch',
  mascot: '🎵',
  mascotName: 'Echo',
  gradient: ['#FFFBEB', '#FEF3C7', '#F5F3FF', '#EDE9FE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(167, 139, 250, 0.45)',
  promptGlow: 'rgba(254, 243, 199, 0.75)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 8 · Game 3 — Gulch Clap Beat */
export const IG_CLAP_THEME = {
  id: 'ig-clap',
  name: 'Gulch Clap Beat',
  mascot: '👏',
  mascotName: 'Beat',
  gradient: ['#FFFBEB', '#FEF9C3', '#FEF3C7', '#FDE68A'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#CA8A04',
  accentSoft: '#FACC15',
  accentDeep: '#A16207',
  ink: '#713F12',
  inkMuted: '#854D0E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(250, 204, 21, 0.45)',
  clapBtn: '#FEF08A',
  clapBorder: '#EAB308',
  doneGradient: ['#FACC15', '#CA8A04', '#A16207'] as const,
} as const;

/** Session 8 · Game 4 — Gulch Sort Nook */
export const IG_SORT_THEME = {
  id: 'ig-sort',
  name: 'Gulch Sort Nook',
  mascot: '🔧',
  mascotName: 'Sorter',
  gradient: ['#FFFBEB', '#FEF3C7', '#EFF6FF', '#DBEAFE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#2563EB',
  accentSoft: '#60A5FA',
  accentDeep: '#1D4ED8',
  ink: '#1E3A8A',
  inkMuted: '#1D4ED8',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(96, 165, 250, 0.45)',
  basket: 'rgba(224, 242, 254, 0.85)',
  basketBorder: 'rgba(37, 99, 235, 0.45)',
  cardBorder: 'rgba(37, 99, 235, 0.4)',
  doneGradient: ['#60A5FA', '#2563EB', '#1D4ED8'] as const,
} as const;

/** Session 8 · Task 5 — Golden Journal */
export const IG_NOTEBOOK_THEME = {
  id: 'ig-notebook',
  name: 'Golden Journal',
  mascot: '📓',
  mascotName: 'Scribe',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#B45309',
  accentSoft: '#FBBF24',
  accentDeep: '#78350F',
  ink: '#78350F',
  inkMuted: '#92400E',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 191, 36, 0.45)',
  frame: 'rgba(255,255,255,0.98)',
  frameBorder: 'rgba(180, 83, 9, 0.4)',
  gold: '#FBBF24',
  goldSoft: '#FEF3C7',
  doneGradient: ['#FBBF24', '#B45309', '#78350F'] as const,
  steps: ['Write pig', 'Write dig', 'Write wig', 'Snap photo'] as const,
} as const;

/** Session 8 quest cards */
export const GROUPER_S8_QUESTS = [
  { step: 1, theme: IG_FINDER_THEME, label: 'IG Word Scout', desc: 'Tap all the -IG family words' },
  { step: 2, theme: IG_RHYME_THEME, label: 'Pig Rhyme', desc: 'Find the word that rhymes with pig' },
  { step: 3, theme: IG_CLAP_THEME, label: 'Gulch Clap', desc: 'Clap once for pig and dig' },
  { step: 4, theme: IG_SORT_THEME, label: 'Gulch Sort', desc: 'Sort animals and tools or actions' },
  { step: 5, theme: IG_NOTEBOOK_THEME, label: 'Golden Journal', desc: 'Write pig, dig, wig, then upload a photo' },
] as const;

/** Session 9 hub — Challenge Camp */
export const GROUPER_S9_HUB_THEME = {
  id: 'challenge-camp',
  name: 'Challenge Camp',
  mascot: '⚡',
  mascotName: 'Bolt',
  gradient: ['#EEF2FF', '#C7D2FE', '#FEF9C3', '#FDE047'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#4F46E5',
  accentSoft: '#818CF8',
  accentDeep: '#3730A3',
  ink: '#312E81',
  inkMuted: '#4338CA',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(129, 140, 248, 0.45)',
  sunGlow: 'rgba(253, 224, 71, 0.35)',
  doneGradient: ['#818CF8', '#4F46E5', '#3730A3'] as const,
} as const;

/** Session 9 · Game 1 — Family Sort Arena */
export const CHALLENGE_FAMILY_SORT_THEME = {
  id: 'challenge-family-sort',
  name: 'Family Sort Arena',
  mascot: '🧺',
  mascotName: 'Sorter',
  gradient: ['#EEF2FF', '#C7D2FE', '#FFFBEB', '#FEF3C7'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#4F46E5',
  accentSoft: '#818CF8',
  accentDeep: '#3730A3',
  ink: '#312E81',
  inkMuted: '#4338CA',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(129, 140, 248, 0.45)',
  wordCard: 'rgba(255,255,255,0.95)',
  wordBorder: 'rgba(79, 70, 229, 0.4)',
  box: 'rgba(238, 242, 255, 0.9)',
  boxBorder: 'rgba(79, 70, 229, 0.45)',
  doneGradient: ['#818CF8', '#4F46E5', '#3730A3'] as const,
} as const;

/** Session 9 · Game 2 — Rhyme Match Circuit */
export const CHALLENGE_RHYME_THEME = {
  id: 'challenge-rhyme',
  name: 'Rhyme Match Circuit',
  mascot: '🎵',
  mascotName: 'Harmony',
  gradient: ['#EEF2FF', '#C7D2FE', '#F5F3FF', '#EDE9FE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(167, 139, 250, 0.45)',
  promptGlow: 'rgba(224, 231, 255, 0.75)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 9 · Game 3 — Syllable Clap Rally */
export const CHALLENGE_SYLLABLE_THEME = {
  id: 'challenge-syllable',
  name: 'Syllable Clap Rally',
  mascot: '👏',
  mascotName: 'Beat',
  gradient: ['#FFFBEB', '#FEF9C3', '#EEF2FF', '#C7D2FE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#CA8A04',
  accentSoft: '#FACC15',
  accentDeep: '#A16207',
  ink: '#713F12',
  inkMuted: '#854D0E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(250, 204, 21, 0.45)',
  clapBtn: '#FEF08A',
  clapBorder: '#EAB308',
  doneGradient: ['#FACC15', '#CA8A04', '#A16207'] as const,
} as const;

/** Session 9 · Game 4 — Category Sort Base */
export const CHALLENGE_CATEGORY_SORT_THEME = {
  id: 'challenge-category-sort',
  name: 'Category Sort Base',
  mascot: '📦',
  mascotName: 'Sorter',
  gradient: ['#EEF2FF', '#C7D2FE', '#ECFDF5', '#D1FAE5'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#059669',
  accentSoft: '#34D399',
  accentDeep: '#047857',
  ink: '#064E3B',
  inkMuted: '#047857',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(52, 211, 153, 0.45)',
  basket: 'rgba(236, 253, 245, 0.85)',
  basketBorder: 'rgba(5, 150, 105, 0.45)',
  cardBorder: 'rgba(5, 150, 105, 0.4)',
  doneGradient: ['#34D399', '#059669', '#047857'] as const,
} as const;

/** Session 9 · Task 5 — Champion Journal */
export const CHALLENGE_NOTEBOOK_THEME = {
  id: 'challenge-notebook',
  name: 'Champion Journal',
  mascot: '📓',
  mascotName: 'Scribe',
  gradient: ['#EEF2FF', '#C7D2FE', '#FEF9C3', '#FDE047'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#3730A3',
  accentSoft: '#818CF8',
  accentDeep: '#312E81',
  ink: '#312E81',
  inkMuted: '#4338CA',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(129, 140, 248, 0.45)',
  frame: 'rgba(255,255,255,0.98)',
  frameBorder: 'rgba(55, 48, 163, 0.4)',
  gold: '#818CF8',
  goldSoft: '#E0E7FF',
  doneGradient: ['#818CF8', '#3730A3', '#312E81'] as const,
  steps: ['Write 5 rhyming words', 'Snap photo'] as const,
} as const;

/** Session 9 quest cards */
export const GROUPER_S9_QUESTS = [
  { step: 1, theme: CHALLENGE_FAMILY_SORT_THEME, label: 'Family Sort', desc: 'Sort cat, pin, sun, top, fan into their families' },
  { step: 2, theme: CHALLENGE_RHYME_THEME, label: 'Rhyme Circuit', desc: 'Match rhymes across all families' },
  { step: 3, theme: CHALLENGE_SYLLABLE_THEME, label: 'Syllable Rally', desc: 'Clap twice for rabbit, tiger, and monkey' },
  { step: 4, theme: CHALLENGE_CATEGORY_SORT_THEME, label: 'Category Sort', desc: 'Sort food, animals, and objects' },
  { step: 5, theme: CHALLENGE_NOTEBOOK_THEME, label: 'Champion Journal', desc: 'Write 5 rhyming words, then upload a photo' },
] as const;

/** Session 10 hub — Summit Sands */
export const GROUPER_S10_HUB_THEME = {
  id: 'summit-sands',
  name: 'Summit Sands',
  mascot: '🏆',
  mascotName: 'Summit',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#F59E0B'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 191, 36, 0.45)',
  sunGlow: 'rgba(245, 158, 11, 0.35)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 10 · Game 1 — Family Hunt Summit */
export const MASTER_HUNT_THEME = {
  id: 'master-hunt',
  name: 'Family Hunt Summit',
  mascot: '🔍',
  mascotName: 'Scout',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 191, 36, 0.45)',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(217, 119, 6, 0.4)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  targetGlow: 'rgba(254, 243, 199, 0.75)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 10 · Game 2 — Rhyme Quiz Peak */
export const MASTER_RHYME_THEME = {
  id: 'master-rhyme',
  name: 'Rhyme Quiz Peak',
  mascot: '🎵',
  mascotName: 'Echo',
  gradient: ['#FFFBEB', '#FEF3C7', '#F5F3FF', '#EDE9FE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(167, 139, 250, 0.45)',
  promptGlow: 'rgba(254, 243, 199, 0.75)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 10 · Game 3 — Syllable Clap Summit */
export const MASTER_SYLLABLE_THEME = {
  id: 'master-syllable',
  name: 'Syllable Clap Summit',
  mascot: '👏',
  mascotName: 'Beat',
  gradient: ['#FFFBEB', '#FEF9C3', '#FEF3C7', '#FDE68A'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#CA8A04',
  accentSoft: '#FACC15',
  accentDeep: '#A16207',
  ink: '#713F12',
  inkMuted: '#854D0E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(250, 204, 21, 0.45)',
  clapBtn: '#FEF08A',
  clapBorder: '#EAB308',
  doneGradient: ['#FACC15', '#CA8A04', '#A16207'] as const,
} as const;

/** Session 10 · Game 4 — Big Sort Summit */
export const MASTER_BIG_SORT_THEME = {
  id: 'master-big-sort',
  name: 'Big Sort Summit',
  mascot: '📦',
  mascotName: 'Sorter',
  gradient: ['#FFFBEB', '#FEF3C7', '#EFF6FF', '#DBEAFE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#2563EB',
  accentSoft: '#60A5FA',
  accentDeep: '#1D4ED8',
  ink: '#1E3A8A',
  inkMuted: '#1D4ED8',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(96, 165, 250, 0.45)',
  basket: 'rgba(224, 242, 254, 0.85)',
  basketBorder: 'rgba(37, 99, 235, 0.45)',
  cardBorder: 'rgba(37, 99, 235, 0.4)',
  doneGradient: ['#60A5FA', '#2563EB', '#1D4ED8'] as const,
} as const;

/** Session 10 · Task 5 — Master Journal */
export const MASTER_NOTEBOOK_THEME = {
  id: 'master-notebook',
  name: 'Master Journal',
  mascot: '📓',
  mascotName: 'Scribe',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#F59E0B'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#B45309',
  accentSoft: '#FBBF24',
  accentDeep: '#78350F',
  ink: '#78350F',
  inkMuted: '#92400E',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 191, 36, 0.45)',
  frame: 'rgba(255,255,255,0.98)',
  frameBorder: 'rgba(180, 83, 9, 0.4)',
  gold: '#FBBF24',
  goldSoft: '#FEF3C7',
  doneGradient: ['#FBBF24', '#B45309', '#78350F'] as const,
  steps: ['Write -at word', 'Write -in word', 'Write -un word', 'Write -op word', 'Snap photo'] as const,
} as const;

/** Session 10 quest cards */
export const GROUPER_S10_QUESTS = [
  { step: 1, theme: MASTER_HUNT_THEME, label: 'Family Hunt', desc: 'Find cat, sun, pin, and top from word families' },
  { step: 2, theme: MASTER_RHYME_THEME, label: 'Rhyme Quiz', desc: 'Match rhymes: cat→hat, pin→tin, sun→bun' },
  { step: 3, theme: MASTER_SYLLABLE_THEME, label: 'Syllable Summit', desc: 'Clap syllables for elephant, butterfly, and tiger' },
  { step: 4, theme: MASTER_BIG_SORT_THEME, label: 'Big Sort', desc: 'Sort into animals, clothes, tools, and food' },
  { step: 5, theme: MASTER_NOTEBOOK_THEME, label: 'Master Journal', desc: 'Write one word from -at, -in, -un, -op, then upload a photo' },
] as const;
