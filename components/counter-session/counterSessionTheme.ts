/** Design tokens — Counter (Section 5) sky curriculum */

export const COUNTER_SESSION = {
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

/** Session hub — Pattern Plaza sky terrace */
export const COUNTER_HUB_THEME = {
  id: 'pattern-plaza',
  name: 'Pattern Plaza',
  mascot: '☁️',
  mascotName: 'Nimbus',
  gradient: ['#F0F9FF', '#E0F2FE', '#BAE6FD', '#7DD3FC'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0284C7',
  accentSoft: '#38BDF8',
  accentDeep: '#0369A1',
  ink: '#0C4A6E',
  inkMuted: '#0369A1',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(56, 189, 248, 0.45)',
  doneGradient: ['#38BDF8', '#0284C7', '#0369A1'] as const,
} as const;

/** Session 1 · Game 1 — Pattern Orbit */
export const PATTERN_ORBIT_THEME = {
  id: 'pattern-orbit',
  name: 'Pattern Orbit',
  mascot: '🔁',
  mascotName: 'Orbit',
  gradient: ['#EFF6FF', '#DBEAFE', '#E0F2FE', '#BAE6FD'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#2563EB',
  accentSoft: '#60A5FA',
  accentDeep: '#1D4ED8',
  ink: '#1E3A8A',
  inkMuted: '#1D4ED8',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(96, 165, 250, 0.45)',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(37, 99, 235, 0.4)',
  tileCorrect: '#22C55E',
  tileWrong: '#EF4444',
  doneGradient: ['#60A5FA', '#2563EB', '#1D4ED8'] as const,
} as const;

/** Session 1 · Game 2 — Star Memory Deck */
export const STAR_MEMORY_THEME = {
  id: 'star-memory',
  name: 'Star Memory Deck',
  mascot: '🎴',
  mascotName: 'Deck',
  gradient: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(167, 139, 250, 0.45)',
  cardBack: '#7C3AED',
  cardFace: '#FFFFFF',
  cardMatch: '#22C55E',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 1 · Game 3 — Balloon Letter Launch */
export const BALLOON_LETTER_THEME = {
  id: 'balloon-letter',
  name: 'Balloon Letter Launch',
  mascot: '⚽',
  mascotName: 'Pop',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 191, 36, 0.45)',
  slot: 'rgba(255,255,255,0.9)',
  slotBorder: 'rgba(251, 191, 36, 0.55)',
  letterBtn: '#FFFFFF',
  letterBorder: 'rgba(217, 119, 6, 0.45)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 1 · Game 4 — Cloud Sort Bay */
export const CLOUD_SORT_THEME = {
  id: 'cloud-sort',
  name: 'Cloud Sort Bay',
  mascot: '📂',
  mascotName: 'Sorty',
  gradient: ['#ECFDF5', '#D1FAE5', '#A7F3D0', '#6EE7B7'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#059669',
  accentSoft: '#34D399',
  accentDeep: '#047857',
  ink: '#064E3B',
  inkMuted: '#047857',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(52, 211, 153, 0.45)',
  animals: '#FEF3C7',
  animalsBorder: '#F59E0B',
  fruits: '#DCFCE7',
  fruitsBorder: '#22C55E',
  itemSelected: '#BBF7D0',
  doneGradient: ['#34D399', '#059669', '#047857'] as const,
} as const;

/** Session 1 · Game 5 — Line Scout Snapshot */
export const LINE_SNAPSHOT_THEME = {
  id: 'line-snapshot',
  name: 'Line Scout Snapshot',
  mascot: '📐',
  mascotName: 'Scout',
  gradient: ['#0C4A6E', '#155E75', '#0891B2', '#22D3EE'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#22D3EE',
  accentSoft: '#67E8F9',
  accentDeep: '#0E7490',
  ink: '#F0FDFA',
  inkMuted: '#A5F3FC',
  inkDark: '#164E63',
  frame: 'rgba(255,255,255,0.95)',
  frameBorder: 'rgba(103, 232, 249, 0.5)',
  doneGradient: ['#22D3EE', '#0891B2', '#0E7490'] as const,
  steps: ['Place 3 objects', 'Take a photo', 'AI verifies'] as const,
} as const;

/** Session 1 quest cards — must follow theme constants above */
export const COUNTER_S1_QUESTS = [
  { step: 1, theme: PATTERN_ORBIT_THEME, label: 'Pattern Orbit', desc: 'What shape comes next in the orbit?' },
  { step: 2, theme: STAR_MEMORY_THEME, label: 'Star Memory', desc: 'Flip cards and match three pairs' },
  { step: 3, theme: BALLOON_LETTER_THEME, label: 'Balloon Letters', desc: 'Tap letters to spell BALL' },
  { step: 4, theme: CLOUD_SORT_THEME, label: 'Cloud Sort', desc: 'Sort animals and fruits' },
  { step: 5, theme: LINE_SNAPSHOT_THEME, label: 'Line Snapshot', desc: 'Place three objects in a line and photograph' },
] as const;

/** Session 2 hub — Count Corner */
export const COUNTER_S2_HUB_THEME = {
  id: 'count-corner',
  name: 'Count Corner',
  mascot: '🔢',
  mascotName: 'Tally',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 191, 36, 0.45)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 2 · Game 1 — Star Tally Tower */
export const STAR_TALLY_THEME = {
  id: 'star-tally',
  name: 'Star Tally Tower',
  mascot: '⭐',
  mascotName: 'Twinkle',
  gradient: ['#FFFBEB', '#FEF9C3', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#CA8A04',
  accentSoft: '#FACC15',
  accentDeep: '#A16207',
  ink: '#713F12',
  inkMuted: '#854D0E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(250, 204, 21, 0.45)',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(202, 138, 4, 0.4)',
  doneGradient: ['#FACC15', '#CA8A04', '#A16207'] as const,
} as const;

/** Session 2 · Game 2 — Giant's Scale */
export const GIANT_SCALE_THEME = {
  id: 'giant-scale',
  name: "Giant's Scale",
  mascot: '📏',
  mascotName: 'Scale',
  gradient: ['#EEF2FF', '#E0E7FF', '#C7D2FE', '#A5B4FC'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#4F46E5',
  accentSoft: '#818CF8',
  accentDeep: '#4338CA',
  ink: '#312E81',
  inkMuted: '#4338CA',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(129, 140, 248, 0.45)',
  objectBorder: 'rgba(79, 70, 229, 0.45)',
  objectFill: 'rgba(224, 231, 255, 0.9)',
  doneGradient: ['#818CF8', '#4F46E5', '#4338CA'] as const,
} as const;

/** Session 2 · Game 3 — Number Ladder */
export const NUMBER_LADDER_THEME = {
  id: 'number-ladder',
  name: 'Number Ladder',
  mascot: '🔢',
  mascotName: 'Climb',
  gradient: ['#F0FDFA', '#CCFBF1', '#99F6E4', '#5EEAD4'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0D9488',
  accentSoft: '#2DD4BF',
  accentDeep: '#0F766E',
  ink: '#134E4A',
  inkMuted: '#0F766E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(45, 212, 191, 0.45)',
  slot: 'rgba(255,255,255,0.9)',
  slotBorder: 'rgba(13, 148, 136, 0.45)',
  numBtn: '#FFFFFF',
  numBorder: 'rgba(13, 148, 136, 0.4)',
  doneGradient: ['#2DD4BF', '#0D9488', '#0F766E'] as const,
} as const;

/** Session 2 · Game 4 — Odd One Out Observatory */
export const ODD_ONE_THEME = {
  id: 'odd-one',
  name: 'Odd One Out Observatory',
  mascot: '🧠',
  mascotName: 'Scope',
  gradient: ['#FFF1F2', '#FFE4E6', '#FECDD3', '#FDA4AF'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#E11D48',
  accentSoft: '#FB7185',
  accentDeep: '#BE123C',
  ink: '#881337',
  inkMuted: '#BE123C',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 113, 133, 0.45)',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(225, 29, 72, 0.35)',
  doneGradient: ['#FB7185', '#E11D48', '#BE123C'] as const,
} as const;

/** Session 2 · Game 5 — Book Stack Snapshot */
export const BOOK_STACK_THEME = {
  id: 'book-stack',
  name: 'Book Stack Snapshot',
  mascot: '📚',
  mascotName: 'Librarian',
  gradient: ['#1E293B', '#334155', '#475569', '#64748B'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#FBBF24',
  accentSoft: '#FDE68A',
  accentDeep: '#D97706',
  ink: '#FFFBEB',
  inkMuted: '#FDE68A',
  inkDark: '#1E293B',
  frame: 'rgba(255,255,255,0.95)',
  frameBorder: 'rgba(251, 191, 36, 0.45)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
  steps: ['Stack 2 books', 'Take a photo', 'AI verifies'] as const,
} as const;

/** Session 2 quest cards */
export const COUNTER_S2_QUESTS = [
  { step: 1, theme: STAR_TALLY_THEME, label: 'Star Tally', desc: 'Count the stars and tap seven' },
  { step: 2, theme: GIANT_SCALE_THEME, label: "Giant's Scale", desc: 'Tap the largest object' },
  { step: 3, theme: NUMBER_LADDER_THEME, label: 'Number Ladder', desc: 'Tap 4, 5, 6, 7 in order' },
  { step: 4, theme: ODD_ONE_THEME, label: 'Odd One Out', desc: 'Find what does not belong' },
  { step: 5, theme: BOOK_STACK_THEME, label: 'Book Stack', desc: 'Photograph two books stacked' },
] as const;

/** Session 3 hub — Shape Skyway */
export const COUNTER_S3_HUB_THEME = {
  id: 'shape-skyway',
  name: 'Shape Skyway',
  mascot: '🔺',
  mascotName: 'Vertex',
  gradient: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(167, 139, 250, 0.45)',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 3 · Game 1 — Spin Triangle Deck */
export const SPIN_TRIANGLE_THEME = {
  id: 'spin-triangle',
  name: 'Spin Triangle Deck',
  mascot: '🔺',
  mascotName: 'Spin',
  gradient: ['#EEF2FF', '#E0E7FF', '#C7D2FE', '#A5B4FC'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#4F46E5',
  accentSoft: '#818CF8',
  accentDeep: '#4338CA',
  ink: '#312E81',
  inkMuted: '#4338CA',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(129, 140, 248, 0.45)',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(79, 70, 229, 0.4)',
  triangle: '#6366F1',
  triangleRotated: '#4338CA',
  doneGradient: ['#818CF8', '#4F46E5', '#4338CA'] as const,
} as const;

/** Session 3 · Game 2 — Echo Animal Bay */
export const ECHO_ANIMAL_THEME = {
  id: 'echo-animal',
  name: 'Echo Animal Bay',
  mascot: '🔊',
  mascotName: 'Echo',
  gradient: ['#ECFDF5', '#D1FAE5', '#A7F3D0', '#6EE7B7'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#059669',
  accentSoft: '#34D399',
  accentDeep: '#047857',
  ink: '#064E3B',
  inkMuted: '#047857',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(52, 211, 153, 0.45)',
  soundBox: 'rgba(209, 250, 229, 0.9)',
  soundBorder: 'rgba(5, 150, 105, 0.45)',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(5, 150, 105, 0.35)',
  doneGradient: ['#34D399', '#059669', '#047857'] as const,
} as const;

/** Session 3 · Game 3 — Sky Memory Grid (8 cards) */
export const SKY_MEMORY_THEME = {
  id: 'sky-memory',
  name: 'Sky Memory Grid',
  mascot: '🎴',
  mascotName: 'Grid',
  gradient: ['#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#EA580C',
  accentSoft: '#FB923C',
  accentDeep: '#C2410C',
  ink: '#7C2D12',
  inkMuted: '#9A3412',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 146, 60, 0.45)',
  cardBack: '#EA580C',
  cardFace: '#FFFFFF',
  cardMatch: '#22C55E',
  doneGradient: ['#FB923C', '#EA580C', '#C2410C'] as const,
} as const;

/** Session 3 · Game 4 — Cloud House Builder */
export const CLOUD_HOUSE_THEME = {
  id: 'cloud-house',
  name: 'Cloud House Builder',
  mascot: '🏠',
  mascotName: 'Builder',
  gradient: ['#F0F9FF', '#E0F2FE', '#BAE6FD', '#7DD3FC'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0284C7',
  accentSoft: '#38BDF8',
  accentDeep: '#0369A1',
  ink: '#0C4A6E',
  inkMuted: '#0369A1',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(56, 189, 248, 0.45)',
  partSelected: '#BBF7D0',
  slotFilled: 'rgba(220, 252, 231, 0.95)',
  frame: 'rgba(241, 245, 249, 0.95)',
  frameBorder: 'rgba(148, 163, 184, 0.55)',
  doneGradient: ['#38BDF8', '#0284C7', '#0369A1'] as const,
} as const;

/** Session 3 · Game 5 — Triangle Hunt Snapshot */
export const TRIANGLE_HUNT_THEME = {
  id: 'triangle-hunt',
  name: 'Triangle Hunt Snapshot',
  mascot: '🔺',
  mascotName: 'Hunter',
  gradient: ['#312E81', '#3730A3', '#4338CA', '#6366F1'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#A5B4FC',
  accentSoft: '#C7D2FE',
  accentDeep: '#818CF8',
  ink: '#EEF2FF',
  inkMuted: '#C7D2FE',
  inkDark: '#312E81',
  frame: 'rgba(255,255,255,0.95)',
  frameBorder: 'rgba(165, 180, 252, 0.5)',
  doneGradient: ['#A5B4FC', '#6366F1', '#4338CA'] as const,
  steps: ['Find a triangle', 'Take a photo', 'AI verifies'] as const,
} as const;

/** Session 3 quest cards */
export const COUNTER_S3_QUESTS = [
  { step: 1, theme: SPIN_TRIANGLE_THEME, label: 'Spin Triangle', desc: 'Find the rotated triangle' },
  { step: 2, theme: ECHO_ANIMAL_THEME, label: 'Echo Animals', desc: 'Which animal says woof?' },
  { step: 3, theme: SKY_MEMORY_THEME, label: 'Sky Memory', desc: 'Match all four pairs (8 cards)' },
  { step: 4, theme: CLOUD_HOUSE_THEME, label: 'Cloud House', desc: 'Assemble roof, wall, and door' },
  { step: 5, theme: TRIANGLE_HUNT_THEME, label: 'Triangle Hunt', desc: 'Photograph a triangle shape nearby' },
] as const;

/** Session 4 hub — Color Cloud */
export const COUNTER_S4_HUB_THEME = {
  id: 'color-cloud',
  name: 'Color Cloud',
  mascot: '🎨',
  mascotName: 'Palette',
  gradient: ['#FFF1F2', '#FFE4E6', '#FCE7F3', '#FBCFE8'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#DB2777',
  accentSoft: '#F472B6',
  accentDeep: '#BE185D',
  ink: '#831843',
  inkMuted: '#9D174D',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(244, 114, 182, 0.45)',
  doneGradient: ['#F472B6', '#DB2777', '#BE185D'] as const,
} as const;

/** Session 4 · Game 1 — Rainbow Rhythm */
export const RAINBOW_RHYTHM_THEME = {
  id: 'rainbow-rhythm',
  name: 'Rainbow Rhythm',
  mascot: '🎨',
  mascotName: 'Hue',
  gradient: ['#FFF1F2', '#FFE4E6', '#FECDD3', '#FDA4AF'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#E11D48',
  accentSoft: '#FB7185',
  accentDeep: '#BE123C',
  ink: '#881337',
  inkMuted: '#BE123C',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 113, 133, 0.45)',
  doneGradient: ['#FB7185', '#E11D48', '#BE123C'] as const,
} as const;

/** Session 4 · Game 2 — Tool Match Terrace */
export const TOOL_MATCH_THEME = {
  id: 'tool-match',
  name: 'Tool Match Terrace',
  mascot: '🥄',
  mascotName: 'Match',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 191, 36, 0.45)',
  useBox: 'rgba(254, 243, 199, 0.9)',
  useBorder: 'rgba(217, 119, 6, 0.45)',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(217, 119, 6, 0.35)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 4 · Game 3 — Number Nest */
export const NUMBER_NEST_THEME = {
  id: 'number-nest',
  name: 'Number Nest',
  mascot: '🔢',
  mascotName: 'Nest',
  gradient: ['#F0FDFA', '#CCFBF1', '#99F6E4', '#5EEAD4'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0D9488',
  accentSoft: '#2DD4BF',
  accentDeep: '#0F766E',
  ink: '#134E4A',
  inkMuted: '#0F766E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(45, 212, 191, 0.45)',
  slot: 'rgba(255,255,255,0.9)',
  slotBorder: 'rgba(13, 148, 136, 0.45)',
  numBtn: '#FFFFFF',
  numBorder: 'rgba(13, 148, 136, 0.4)',
  doneGradient: ['#2DD4BF', '#0D9488', '#0F766E'] as const,
} as const;

/** Session 4 · Game 4 — Shadow Silhouette Deck */
export const SHADOW_SILHOUETTE_THEME = {
  id: 'shadow-silhouette',
  name: 'Shadow Silhouette Deck',
  mascot: '🌑',
  mascotName: 'Shade',
  gradient: ['#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#475569',
  accentSoft: '#64748B',
  accentDeep: '#334155',
  ink: '#1E293B',
  inkMuted: '#475569',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(100, 116, 139, 0.45)',
  shadow: '#334155',
  tile: 'rgba(255,255,255,0.95)',
  tileBorder: 'rgba(71, 85, 105, 0.35)',
  doneGradient: ['#64748B', '#475569', '#334155'] as const,
} as const;

/** Session 4 · Game 5 — Same Color Snapshot */
export const SAME_COLOR_THEME = {
  id: 'same-color',
  name: 'Same Color Snapshot',
  mascot: '🎨',
  mascotName: 'Chroma',
  gradient: ['#4C0519', '#831843', '#9D174D', '#BE185D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#F472B6',
  accentSoft: '#FBCFE8',
  accentDeep: '#DB2777',
  ink: '#FFF1F2',
  inkMuted: '#FBCFE8',
  inkDark: '#4C0519',
  frame: 'rgba(255,255,255,0.95)',
  frameBorder: 'rgba(244, 114, 182, 0.5)',
  doneGradient: ['#F472B6', '#DB2777', '#BE185D'] as const,
  steps: ['Find 3 same-color objects', 'Take a photo', 'AI verifies'] as const,
} as const;

/** Session 4 quest cards */
export const COUNTER_S4_QUESTS = [
  { step: 1, theme: RAINBOW_RHYTHM_THEME, label: 'Rainbow Rhythm', desc: 'Red, blue, red, blue — what next?' },
  { step: 2, theme: TOOL_MATCH_THEME, label: 'Tool Match', desc: 'What do we use for eating?' },
  { step: 3, theme: NUMBER_NEST_THEME, label: 'Number Nest', desc: 'Tap 8, 9, 10 in order' },
  { step: 4, theme: SHADOW_SILHOUETTE_THEME, label: 'Shadow Deck', desc: 'Match the ball to its shadow' },
  { step: 5, theme: SAME_COLOR_THEME, label: 'Same Color', desc: 'Photograph three objects of the same color' },
] as const;

/** Session 5 hub — Wind Vane */
export const COUNTER_S5_HUB_THEME = {
  id: 'wind-vane',
  name: 'Wind Vane',
  mascot: '🧭',
  mascotName: 'Compass',
  gradient: ['#F0FDFA', '#CCFBF1', '#A5F3FC', '#67E8F9'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0891B2',
  accentSoft: '#22D3EE',
  accentDeep: '#0E7490',
  ink: '#164E63',
  inkMuted: '#0E7490',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(34, 211, 238, 0.45)',
  doneGradient: ['#22D3EE', '#0891B2', '#0E7490'] as const,
} as const;

/** Session 5 · Game 1 — Compass Crossing */
export const COMPASS_CROSSING_THEME = {
  id: 'compass-crossing',
  name: 'Compass Crossing',
  mascot: '🧭',
  mascotName: 'North',
  gradient: ['#ECFEFF', '#CFFAFE', '#A5F3FC', '#67E8F9'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0284C7',
  accentSoft: '#38BDF8',
  accentDeep: '#0369A1',
  ink: '#0C4A6E',
  inkMuted: '#0369A1',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(56, 189, 248, 0.45)',
  grid: '#E0F2FE',
  gridBorder: '#38BDF8',
  cellBorder: 'rgba(56, 189, 248, 0.4)',
  arrowBtn: '#FFFFFF',
  arrowBorder: '#38BDF8',
  doneGradient: ['#38BDF8', '#0284C7', '#0369A1'] as const,
} as const;

/** Session 5 · Game 2 — Vane Memory Deck */
export const VANE_MEMORY_THEME = {
  id: 'vane-memory',
  name: 'Vane Memory Deck',
  mascot: '🎴',
  mascotName: 'Deck',
  gradient: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(167, 139, 250, 0.45)',
  cardBack: '#7C3AED',
  cardFace: '#FFFFFF',
  cardMatch: '#22C55E',
  cardBorder: 'rgba(124, 58, 237, 0.45)',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 5 · Game 3 — Sun Spell Terrace */
export const SUN_SPELL_THEME = {
  id: 'sun-spell',
  name: 'Sun Spell Terrace',
  mascot: '☀️',
  mascotName: 'Ray',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 191, 36, 0.45)',
  slot: '#E0F2FE',
  slotBorder: '#38BDF8',
  letterBtn: '#FFFFFF',
  letterBorder: 'rgba(217, 119, 6, 0.45)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 5 · Game 4 — Room Sort Loft */
export const ROOM_SORT_THEME = {
  id: 'room-sort',
  name: 'Room Sort Loft',
  mascot: '🏠',
  mascotName: 'Sorter',
  gradient: ['#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#059669',
  accentSoft: '#34D399',
  accentDeep: '#047857',
  ink: '#064E3B',
  inkMuted: '#047857',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(52, 211, 153, 0.45)',
  itemBtn: '#FFFFFF',
  itemBorder: 'rgba(5, 150, 105, 0.35)',
  kitchenBg: '#FEF3C7',
  kitchenBorder: '#F59E0B',
  bedroomBg: '#E0E7FF',
  bedroomBorder: '#6366F1',
  doneGradient: ['#34D399', '#059669', '#047857'] as const,
} as const;

/** Session 5 · Game 5 — Round Hunt Snapshot */
export const ROUND_HUNT_THEME = {
  id: 'round-hunt',
  name: 'Round Hunt Snapshot',
  mascot: '⭕',
  mascotName: 'Orbit',
  gradient: ['#0C4A6E', '#075985', '#0369A1', '#0284C7'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#38BDF8',
  accentSoft: '#7DD3FC',
  accentDeep: '#0EA5E9',
  ink: '#F0F9FF',
  inkMuted: '#BAE6FD',
  inkDark: '#0C4A6E',
  frame: 'rgba(255,255,255,0.95)',
  frameBorder: 'rgba(56, 189, 248, 0.5)',
  doneGradient: ['#38BDF8', '#0284C7', '#0369A1'] as const,
  steps: ['Find something round', 'Take a photo', 'AI verifies'] as const,
} as const;

/** Session 5 quest cards */
export const COUNTER_S5_QUESTS = [
  { step: 1, theme: COMPASS_CROSSING_THEME, label: 'Compass Crossing', desc: 'Move LEFT, RIGHT, UP, DOWN to the star' },
  { step: 2, theme: VANE_MEMORY_THEME, label: 'Vane Memory', desc: 'Match 8 cards — 4 pairs' },
  { step: 3, theme: SUN_SPELL_THEME, label: 'Sun Spell', desc: 'Tap S, U, N in order' },
  { step: 4, theme: ROOM_SORT_THEME, label: 'Room Sort', desc: 'Sort items into Kitchen or Bedroom' },
  { step: 5, theme: ROUND_HUNT_THEME, label: 'Round Hunt', desc: 'Photograph something round' },
] as const;

/** Session 6 hub — Eagle Lookout */
export const COUNTER_S6_HUB_THEME = {
  id: 'eagle-lookout',
  name: 'Eagle Lookout',
  mascot: '🦅',
  mascotName: 'Scout',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 191, 36, 0.45)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 6 · Game 1 — Eagle Eye Deck */
export const EAGLE_EYE_THEME = {
  id: 'eagle-eye',
  name: 'Eagle Eye Deck',
  mascot: '🔍',
  mascotName: 'Spotter',
  gradient: ['#F0F9FF', '#E0F2FE', '#BAE6FD', '#7DD3FC'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0284C7',
  accentSoft: '#38BDF8',
  accentDeep: '#0369A1',
  ink: '#0C4A6E',
  inkMuted: '#0369A1',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(56, 189, 248, 0.45)',
  pictureBg: '#E0F2FE',
  pictureBorder: '#38BDF8',
  foundBorder: '#22C55E',
  doneGradient: ['#38BDF8', '#0284C7', '#0369A1'] as const,
} as const;

/** Session 6 · Game 2 — Apple Orchard Tally */
export const APPLE_TALLY_THEME = {
  id: 'apple-tally',
  name: 'Apple Orchard Tally',
  mascot: '🍎',
  mascotName: 'Tally',
  gradient: ['#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#DC2626',
  accentSoft: '#F87171',
  accentDeep: '#B91C1C',
  ink: '#7F1D1D',
  inkMuted: '#B91C1C',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(248, 113, 113, 0.45)',
  numBtn: '#FFFFFF',
  numBorder: 'rgba(220, 38, 38, 0.4)',
  doneGradient: ['#F87171', '#DC2626', '#B91C1C'] as const,
} as const;

/** Session 6 · Game 3 — Pup Puzzle Ridge */
export const PUP_PUZZLE_THEME = {
  id: 'pup-puzzle',
  name: 'Pup Puzzle Ridge',
  mascot: '🐕',
  mascotName: 'Patch',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#CA8A04',
  accentSoft: '#EAB308',
  accentDeep: '#A16207',
  ink: '#713F12',
  inkMuted: '#92400E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(234, 179, 8, 0.45)',
  partBtn: '#FFFFFF',
  partBorder: 'rgba(202, 138, 4, 0.4)',
  slot: '#FEF3C7',
  slotBorder: '#EAB308',
  doneGradient: ['#EAB308', '#CA8A04', '#A16207'] as const,
} as const;

/** Session 6 · Game 4 — Rectangle Ridge */
export const RECTANGLE_RIDGE_THEME = {
  id: 'rectangle-ridge',
  name: 'Rectangle Ridge',
  mascot: '▭',
  mascotName: 'Shape',
  gradient: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(167, 139, 250, 0.45)',
  shapeBtn: '#FFFFFF',
  shapeBorder: 'rgba(124, 58, 237, 0.4)',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 6 · Game 5 — Four Finger Signal */
export const FOUR_FINGERS_THEME = {
  id: 'four-fingers',
  name: 'Four Finger Signal',
  mascot: '✋',
  mascotName: 'Signal',
  gradient: ['#431407', '#7C2D12', '#9A3412', '#C2410C'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#FB923C',
  accentSoft: '#FDBA74',
  accentDeep: '#EA580C',
  ink: '#FFF7ED',
  inkMuted: '#FED7AA',
  inkDark: '#431407',
  frame: 'rgba(255,255,255,0.95)',
  frameBorder: 'rgba(251, 146, 60, 0.5)',
  doneGradient: ['#FB923C', '#EA580C', '#C2410C'] as const,
  steps: ['Hold up four fingers', 'Take a photo', 'AI verifies'] as const,
} as const;

/** Session 6 quest cards */
export const COUNTER_S6_QUESTS = [
  { step: 1, theme: EAGLE_EYE_THEME, label: 'Eagle Eye', desc: 'Find 3 differences in Picture B' },
  { step: 2, theme: APPLE_TALLY_THEME, label: 'Apple Tally', desc: 'Count 9 apples — tap the number' },
  { step: 3, theme: PUP_PUZZLE_THEME, label: 'Pup Puzzle', desc: 'Place all three dog parts' },
  { step: 4, theme: RECTANGLE_RIDGE_THEME, label: 'Rectangle Ridge', desc: 'Tap the rectangle' },
  { step: 5, theme: FOUR_FINGERS_THEME, label: 'Four Fingers', desc: 'Photograph four fingers up' },
] as const;

/** Session 7 hub — Puzzle Peak */
export const COUNTER_S7_HUB_THEME = {
  id: 'puzzle-peak',
  name: 'Puzzle Peak',
  mascot: '🧩',
  mascotName: 'Piece',
  gradient: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(167, 139, 250, 0.45)',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 7 · Game 1 — Pattern Echo Chamber */
export const PATTERN_ECHO_THEME = {
  id: 'pattern-echo',
  name: 'Pattern Echo Chamber',
  mascot: '🧠',
  mascotName: 'Echo',
  gradient: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#2563EB',
  accentSoft: '#60A5FA',
  accentDeep: '#1D4ED8',
  ink: '#1E3A8A',
  inkMuted: '#1D4ED8',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(96, 165, 250, 0.45)',
  doneGradient: ['#60A5FA', '#2563EB', '#1D4ED8'] as const,
} as const;

/** Session 7 · Game 2 — Size Compare Terrace */
export const SIZE_COMPARE_THEME = {
  id: 'size-compare',
  name: 'Size Compare Terrace',
  mascot: '⚖️',
  mascotName: 'Scale',
  gradient: ['#F0FDFA', '#CCFBF1', '#99F6E4', '#5EEAD4'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0D9488',
  accentSoft: '#2DD4BF',
  accentDeep: '#0F766E',
  ink: '#134E4A',
  inkMuted: '#0F766E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(45, 212, 191, 0.45)',
  circle: '#3B82F6',
  optionBtn: '#FFFFFF',
  optionBorder: 'rgba(13, 148, 136, 0.4)',
  doneGradient: ['#2DD4BF', '#0D9488', '#0F766E'] as const,
} as const;

/** Session 7 · Game 3 — Letter Link Loft */
export const LETTER_LINK_THEME = {
  id: 'letter-link',
  name: 'Letter Link Loft',
  mascot: '🔤',
  mascotName: 'Link',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 191, 36, 0.45)',
  upperBox: '#E0F2FE',
  upperBorder: '#38BDF8',
  letterBtn: '#FFFFFF',
  letterBorder: 'rgba(217, 119, 6, 0.45)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 7 · Game 4 — Car Build Workshop */
export const CAR_BUILD_THEME = {
  id: 'car-build',
  name: 'Car Build Workshop',
  mascot: '🚗',
  mascotName: 'Wrench',
  gradient: ['#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#DC2626',
  accentSoft: '#F87171',
  accentDeep: '#B91C1C',
  ink: '#7F1D1D',
  inkMuted: '#B91C1C',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(248, 113, 113, 0.45)',
  partBtn: '#FFFFFF',
  partBorder: 'rgba(220, 38, 38, 0.4)',
  slot: '#FEE2E2',
  slotBorder: '#F87171',
  doneGradient: ['#F87171', '#DC2626', '#B91C1C'] as const,
} as const;

/** Session 7 · Game 5 — Far Apart Snapshot */
export const FAR_APART_THEME = {
  id: 'far-apart',
  name: 'Far Apart Snapshot',
  mascot: '📏',
  mascotName: 'Span',
  gradient: ['#1E1B4B', '#312E81', '#4338CA', '#4F46E5'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#818CF8',
  accentSoft: '#A5B4FC',
  accentDeep: '#6366F1',
  ink: '#EEF2FF',
  inkMuted: '#C7D2FE',
  inkDark: '#1E1B4B',
  frame: 'rgba(255,255,255,0.95)',
  frameBorder: 'rgba(129, 140, 248, 0.5)',
  doneGradient: ['#818CF8', '#6366F1', '#4F46E5'] as const,
  steps: ['Place two objects far apart', 'Take a photo', 'AI verifies'] as const,
} as const;

/** Session 7 quest cards */
export const COUNTER_S7_QUESTS = [
  { step: 1, theme: PATTERN_ECHO_THEME, label: 'Pattern Echo', desc: 'Watch red, blue, green — then repeat' },
  { step: 2, theme: SIZE_COMPARE_THEME, label: 'Size Compare', desc: 'Tap the smaller circle' },
  { step: 3, theme: LETTER_LINK_THEME, label: 'Letter Link', desc: 'Match big A with small a' },
  { step: 4, theme: CAR_BUILD_THEME, label: 'Car Build', desc: 'Place body and both wheels' },
  { step: 5, theme: FAR_APART_THEME, label: 'Far Apart', desc: 'Photograph two objects far apart' },
] as const;

/** Session 8 hub — Mood Meadow */
export const COUNTER_S8_HUB_THEME = {
  id: 'mood-meadow',
  name: 'Mood Meadow',
  mascot: '😊',
  mascotName: 'Moody',
  gradient: ['#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#16A34A',
  accentSoft: '#4ADE80',
  accentDeep: '#15803D',
  ink: '#14532D',
  inkMuted: '#166534',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(74, 222, 128, 0.45)',
  doneGradient: ['#4ADE80', '#16A34A', '#15803D'] as const,
} as const;

/** Session 8 · Game 1 — Feeling Faces Grove */
export const FEELING_FACES_THEME = {
  id: 'feeling-faces',
  name: 'Feeling Faces Grove',
  mascot: '😢',
  mascotName: 'Feels',
  gradient: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#2563EB',
  accentSoft: '#60A5FA',
  accentDeep: '#1D4ED8',
  ink: '#1E3A8A',
  inkMuted: '#1D4ED8',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(96, 165, 250, 0.45)',
  faceBtn: '#FFFFFF',
  faceBorder: 'rgba(37, 99, 235, 0.4)',
  doneGradient: ['#60A5FA', '#2563EB', '#1D4ED8'] as const,
} as const;

/** Session 8 · Game 2 — Habitat Match Meadow */
export const HABITAT_MATCH_THEME = {
  id: 'habitat-match',
  name: 'Habitat Match Meadow',
  mascot: '🐾',
  mascotName: 'Home',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 191, 36, 0.45)',
  itemBtn: '#FFFFFF',
  itemBorder: 'rgba(217, 119, 6, 0.35)',
  habitatBg: '#E0F2FE',
  habitatBorder: '#38BDF8',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 8 · Game 3 — Dog Spell Patch */
export const DOG_SPELL_THEME = {
  id: 'dog-spell',
  name: 'Dog Spell Patch',
  mascot: '🐕',
  mascotName: 'Bark',
  gradient: ['#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#DC2626',
  accentSoft: '#F87171',
  accentDeep: '#B91C1C',
  ink: '#7F1D1D',
  inkMuted: '#B91C1C',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(248, 113, 113, 0.45)',
  slot: '#E0F2FE',
  slotBorder: '#38BDF8',
  letterBtn: '#FFFFFF',
  letterBorder: 'rgba(220, 38, 38, 0.45)',
  doneGradient: ['#F87171', '#DC2626', '#B91C1C'] as const,
} as const;

/** Session 8 · Game 4 — Shape Hole Puzzle */
export const SHAPE_HOLE_THEME = {
  id: 'shape-hole',
  name: 'Shape Hole Puzzle',
  mascot: '🧩',
  mascotName: 'Fit',
  gradient: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(167, 139, 250, 0.45)',
  shapeBtn: '#FFFFFF',
  shapeBorder: 'rgba(124, 58, 237, 0.4)',
  hole: '#DDD6FE',
  holeBorder: '#A78BFA',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 8 · Game 5 — Green Hunt Snapshot */
export const GREEN_HUNT_THEME = {
  id: 'green-hunt',
  name: 'Green Hunt Snapshot',
  mascot: '🟢',
  mascotName: 'Leaf',
  gradient: ['#052E16', '#14532D', '#166534', '#15803D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#4ADE80',
  accentSoft: '#86EFAC',
  accentDeep: '#22C55E',
  ink: '#F0FDF4',
  inkMuted: '#BBF7D0',
  inkDark: '#052E16',
  frame: 'rgba(255,255,255,0.95)',
  frameBorder: 'rgba(74, 222, 128, 0.5)',
  doneGradient: ['#4ADE80', '#22C55E', '#15803D'] as const,
  steps: ['Find something green', 'Take a photo', 'AI verifies'] as const,
} as const;

/** Session 8 quest cards */
export const COUNTER_S8_QUESTS = [
  { step: 1, theme: FEELING_FACES_THEME, label: 'Feeling Faces', desc: 'Tap the sad face' },
  { step: 2, theme: HABITAT_MATCH_THEME, label: 'Habitat Match', desc: 'Match fish, bird, dog to their homes' },
  { step: 3, theme: DOG_SPELL_THEME, label: 'Dog Spell', desc: 'Tap D, O, G in order' },
  { step: 4, theme: SHAPE_HOLE_THEME, label: 'Shape Holes', desc: 'Fit each shape into its matching hole' },
  { step: 5, theme: GREEN_HUNT_THEME, label: 'Green Hunt', desc: 'Photograph something green' },
] as const;

/** Session 9 hub — Logic Loft */
export const COUNTER_S9_HUB_THEME = {
  id: 'logic-loft',
  name: 'Logic Loft',
  mascot: '🧠',
  mascotName: 'Logic',
  gradient: ['#EEF2FF', '#E0E7FF', '#C7D2FE', '#A5B4FC'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#4F46E5',
  accentSoft: '#818CF8',
  accentDeep: '#4338CA',
  ink: '#312E81',
  inkMuted: '#4338CA',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(129, 140, 248, 0.45)',
  doneGradient: ['#818CF8', '#4F46E5', '#4338CA'] as const,
} as const;

/** Session 9 · Game 1 — Next Number Ladder */
export const NEXT_NUMBER_THEME = {
  id: 'next-number',
  name: 'Next Number Ladder',
  mascot: '🔢',
  mascotName: 'Count',
  gradient: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#2563EB',
  accentSoft: '#60A5FA',
  accentDeep: '#1D4ED8',
  ink: '#1E3A8A',
  inkMuted: '#1D4ED8',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(96, 165, 250, 0.45)',
  patternBox: '#E0F2FE',
  patternBorder: '#38BDF8',
  optionBtn: '#FFFFFF',
  optionBorder: 'rgba(37, 99, 235, 0.4)',
  doneGradient: ['#60A5FA', '#2563EB', '#1D4ED8'] as const,
} as const;

/** Session 9 · Game 2 — Tile Match Tower */
export const TILE_MATCH_THEME = {
  id: 'tile-match',
  name: 'Tile Match Tower',
  mascot: '🎴',
  mascotName: 'Recall',
  gradient: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(167, 139, 250, 0.45)',
  cardBack: '#7C3AED',
  cardFace: '#FFFFFF',
  cardMatch: '#22C55E',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 9 · Game 3 — Size Sort Studio */
export const SIZE_SORT_THEME = {
  id: 'size-sort',
  name: 'Size Sort Studio',
  mascot: '📏',
  mascotName: 'Scale',
  gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(251, 191, 36, 0.45)',
  itemBtn: '#FFFFFF',
  itemBorder: 'rgba(217, 119, 6, 0.35)',
  binBg: '#E0F2FE',
  binBorder: '#38BDF8',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 9 · Game 4 — Pentagon Pick */
export const PENTAGON_PICK_THEME = {
  id: 'pentagon-pick',
  name: 'Pentagon Pick',
  mascot: '⬠',
  mascotName: 'Sides',
  gradient: ['#ECFEFF', '#CFFAFE', '#A5F3FC', '#67E8F9'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0891B2',
  accentSoft: '#22D3EE',
  accentDeep: '#0E7490',
  ink: '#164E63',
  inkMuted: '#0E7490',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(34, 211, 238, 0.45)',
  shapeBtn: '#FFFFFF',
  shapeBorder: 'rgba(8, 145, 178, 0.4)',
  doneGradient: ['#22D3EE', '#0891B2', '#0E7490'] as const,
} as const;

/** Session 9 · Game 5 — Triangle Snapshot */
export const TRIANGLE_SNAPSHOT_THEME = {
  id: 'triangle-snapshot',
  name: 'Triangle Snapshot',
  mascot: '🔺',
  mascotName: 'Vertex',
  gradient: ['#1E1B4B', '#312E81', '#4338CA', '#4F46E5'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#818CF8',
  accentSoft: '#A5B4FC',
  accentDeep: '#6366F1',
  ink: '#EEF2FF',
  inkMuted: '#C7D2FE',
  inkDark: '#1E1B4B',
  frame: 'rgba(255,255,255,0.95)',
  frameBorder: 'rgba(129, 140, 248, 0.5)',
  doneGradient: ['#818CF8', '#6366F1', '#4F46E5'] as const,
  steps: ['Arrange three objects in a triangle', 'Take a photo', 'AI verifies'] as const,
} as const;

/** Session 9 quest cards */
export const COUNTER_S9_QUESTS = [
  { step: 1, theme: NEXT_NUMBER_THEME, label: 'Next Number', desc: 'What comes after 2, 4, 6?' },
  { step: 2, theme: TILE_MATCH_THEME, label: 'Tile Match', desc: 'Flip tiles and match 5 pairs' },
  { step: 3, theme: SIZE_SORT_THEME, label: 'Size Sort', desc: 'Put each ball in the right size box' },
  { step: 4, theme: PENTAGON_PICK_THEME, label: 'Pentagon Pick', desc: 'Tap the shape with five sides' },
  { step: 5, theme: TRIANGLE_SNAPSHOT_THEME, label: 'Triangle Snapshot', desc: 'Photograph three objects in a triangle' },
] as const;

/** Session 10 hub — Summit Sky */
export const COUNTER_S10_HUB_THEME = {
  id: 'summit-sky',
  name: 'Summit Sky',
  mascot: '🏆',
  mascotName: 'Summit',
  gradient: ['#FFFBEB', '#FEF3C7', '#BAE6FD', '#7DD3FC'] as const,
  gradientLocations: [0, 0.3, 0.65, 1] as const,
  accent: '#D97706',
  accentSoft: '#FBBF24',
  accentDeep: '#B45309',
  ink: '#78350F',
  inkMuted: '#92400E',
  card: 'rgba(255,255,255,0.94)',
  cardBorder: 'rgba(251, 191, 36, 0.45)',
  doneGradient: ['#FBBF24', '#D97706', '#B45309'] as const,
} as const;

/** Session 10 · Game 1 — Shape & Color Quiz */
export const MIXED_QUIZ_THEME = {
  id: 'mixed-quiz',
  name: 'Shape & Color Quiz',
  mascot: '❓',
  mascotName: 'Quiz',
  gradient: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#2563EB',
  accentSoft: '#60A5FA',
  accentDeep: '#1D4ED8',
  ink: '#1E3A8A',
  inkMuted: '#1D4ED8',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(96, 165, 250, 0.45)',
  optionBtn: '#FFFFFF',
  optionBorder: 'rgba(37, 99, 235, 0.4)',
  doneGradient: ['#60A5FA', '#2563EB', '#1D4ED8'] as const,
} as const;

/** Session 10 · Game 2 — Master Memory Deck */
export const MASTER_MEMORY_THEME = {
  id: 'master-memory',
  name: 'Master Memory Deck',
  mascot: '🎴',
  mascotName: 'Recall',
  gradient: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#7C3AED',
  accentSoft: '#A78BFA',
  accentDeep: '#6D28D9',
  ink: '#4C1D95',
  inkMuted: '#6D28D9',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(167, 139, 250, 0.45)',
  cardBack: '#7C3AED',
  cardFace: '#FFFFFF',
  cardMatch: '#22C55E',
  doneGradient: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
} as const;

/** Session 10 · Game 3 — House Spell Summit */
export const HOUSE_SPELL_THEME = {
  id: 'house-spell',
  name: 'House Spell Summit',
  mascot: '🏠',
  mascotName: 'Roof',
  gradient: ['#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#DC2626',
  accentSoft: '#F87171',
  accentDeep: '#B91C1C',
  ink: '#7F1D1D',
  inkMuted: '#B91C1C',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(248, 113, 113, 0.45)',
  slot: '#E0F2FE',
  slotBorder: '#38BDF8',
  letterBtn: '#FFFFFF',
  letterBorder: 'rgba(220, 38, 38, 0.45)',
  doneGradient: ['#F87171', '#DC2626', '#B91C1C'] as const,
} as const;

/** Session 10 · Game 4 — Pattern Peak */
export const PATTERN_PEAK_THEME = {
  id: 'pattern-peak',
  name: 'Pattern Peak',
  mascot: '🧩',
  mascotName: 'Repeat',
  gradient: ['#ECFEFF', '#CFFAFE', '#A5F3FC', '#67E8F9'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#0891B2',
  accentSoft: '#22D3EE',
  accentDeep: '#0E7490',
  ink: '#164E63',
  inkMuted: '#0E7490',
  panel: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(34, 211, 238, 0.45)',
  patternBox: '#E0F2FE',
  patternBorder: '#38BDF8',
  optionBtn: '#FFFFFF',
  optionBorder: 'rgba(8, 145, 178, 0.4)',
  doneGradient: ['#22D3EE', '#0891B2', '#0E7490'] as const,
} as const;

/** Session 10 · Game 5 — Tower Snapshot */
export const TOWER_SNAPSHOT_THEME = {
  id: 'tower-snapshot',
  name: 'Tower Snapshot',
  mascot: '🗼',
  mascotName: 'Stack',
  gradient: ['#0C4A6E', '#075985', '#0369A1', '#0284C7'] as const,
  gradientLocations: [0, 0.35, 0.7, 1] as const,
  accent: '#38BDF8',
  accentSoft: '#7DD3FC',
  accentDeep: '#0EA5E9',
  ink: '#F0F9FF',
  inkMuted: '#BAE6FD',
  inkDark: '#0C4A6E',
  frame: 'rgba(255,255,255,0.95)',
  frameBorder: 'rgba(56, 189, 248, 0.5)',
  doneGradient: ['#7DD3FC', '#38BDF8', '#0EA5E9'] as const,
  steps: ['Stack three objects in a tower', 'Take a photo', 'AI verifies'] as const,
} as const;

/** Session 10 quest cards */
export const COUNTER_S10_QUESTS = [
  { step: 1, theme: MIXED_QUIZ_THEME, label: 'Shape & Color Quiz', desc: 'Tap the blue circle and red square' },
  { step: 2, theme: MASTER_MEMORY_THEME, label: 'Master Memory', desc: 'Flip cards and match 6 pairs' },
  { step: 3, theme: HOUSE_SPELL_THEME, label: 'House Spell', desc: 'Tap H, O, U, S, E in order' },
  { step: 4, theme: PATTERN_PEAK_THEME, label: 'Pattern Peak', desc: 'Complete triangle, circle, triangle, circle…' },
  { step: 5, theme: TOWER_SNAPSHOT_THEME, label: 'Tower Snapshot', desc: 'Photograph a 3-object tower' },
] as const;
