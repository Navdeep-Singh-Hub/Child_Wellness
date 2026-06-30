/**
 * OT Level 9 · Session 2 — Pressure Grading themes.
 * Session 2 Game 1: Decorate The Cake · "Sweet Swirl Bakery"
 */

export const CAKE_SHELL = {
  backText: '#FBCFE8',
  backBorder: 'rgba(251,207,232,0.45)',
  statLabel: '#F9A8D4',
  statValue: '#FFFBEB',
  statBorder: 'rgba(249,168,212,0.45)',
  sparkleColor: '#FDE68A',
  good: '#34D399',
  warn: '#FB923C',
  gold: '#FBBF24',
  academyLabel: 'SWEET SWIRL',
} as const;

export type DecorateCakeTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  frosting: string;
  chocolate: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  toppings: string[];
  hintText: string;
  positionCue: string;
  pipeCue: string;
  voiceIntro: string;
  voicePipe: string;
  voiceSwirl: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const DECORATE_CAKE_THEME: DecorateCakeTheme = {
  title: 'Sweet Swirl Bakery',
  subtitle: 'Pipe frosting with graded pressure — gentle swirls to firm rosettes!',
  emoji: '🎂',
  hero: '🧁',
  accent: '#F472B6',
  accentDeep: '#DB2777',
  frosting: '#FBCFE8',
  chocolate: '#78350F',
  glow: 'rgba(244,114,182,0.55)',
  bgGradient: ['#3B1810', '#78350F', '#BE185D', '#FDE68A'],
  decor: ['🧁', '🍰', '✨', '🌸', '🍫', '💗'],
  toppings: ['🌸', '💫', '⭐', '💗', '🌸', '💫', '⭐', '💗'],
  hintText: 'Hold your hands like a piping bag at chest level — squeeze with just-right pressure!',
  positionCue: 'Step back so the camera sees your chest, arms and both hands clearly.',
  pipeCue: 'Pipe the frosting!',
  voiceIntro:
    'Welcome to Sweet Swirl Bakery! Pipe each frosting decoration with graded pressure — gentle to firm!',
  voicePipe: 'Pipe now — steady pressure on the frosting bag!',
  voiceSwirl: 'Beautiful swirl! Perfect piping pressure!',
  voiceComplete: 'Cake complete! You decorated every swirl with amazing pressure control!',
  congrats: 'Master Baker!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export const PAINT_SHELL = {
  backText: '#BAE6FD',
  backBorder: 'rgba(186,230,253,0.45)',
  statLabel: '#7DD3FC',
  statValue: '#F0F9FF',
  statBorder: 'rgba(125,211,252,0.45)',
  sparkleColor: '#FDE68A',
  good: '#34D399',
  warn: '#FB923C',
  gold: '#FBBF24',
  academyLabel: 'COLOR STUDIO',
} as const;

export type PaintPressureTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  canvas: string;
  brush: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  paintColors: string[];
  paintHex: string[];
  hintText: string;
  positionCue: string;
  brushCue: string;
  voiceIntro: string;
  voiceBrush: string;
  voiceStroke: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const PAINT_PRESSURE_THEME: PaintPressureTheme = {
  title: 'Color Splash Studio',
  subtitle: 'Press your brush on the canvas with graded pressure — light washes to bold strokes!',
  emoji: '🎨',
  hero: '🖌️',
  accent: '#3B82F6',
  accentDeep: '#1D4ED8',
  canvas: '#FFFBEB',
  brush: '#F59E0B',
  glow: 'rgba(59,130,246,0.55)',
  bgGradient: ['#0F172A', '#1E3A5F', '#2563EB', '#F59E0B'],
  decor: ['🎨', '🖌️', '✨', '🖼️', '💙', '🌈'],
  paintColors: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🩷', '🟤'],
  paintHex: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7', '#EC4899', '#A16207'],
  hintText: 'Reach toward the canvas and press your brush with just-right pressure — gentle to firm!',
  positionCue: 'Step back so the camera sees your arms, hands and upper body clearly.',
  brushCue: 'Paint the stroke!',
  voiceIntro:
    'Welcome to Color Splash Studio! Press your brush on the canvas with graded pressure for each colorful stroke!',
  voiceBrush: 'Brush now — steady pressure on the canvas!',
  voiceStroke: 'Beautiful stroke! Perfect paint pressure!',
  voiceComplete: 'Masterpiece complete! You painted every stroke with amazing pressure control!',
  congrats: 'Studio Artist!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export const MAGIC_SHELL = {
  backText: '#E9D5FF',
  backBorder: 'rgba(233,213,253,0.45)',
  statLabel: '#C4B5FD',
  statValue: '#FAF5FF',
  statBorder: 'rgba(196,181,253,0.45)',
  sparkleColor: '#FDE68A',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  academyLabel: 'CRYSTAL REALM',
} as const;

export type MagicTouchTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  crystal: string;
  wand: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  crystals: string[];
  hintText: string;
  positionCue: string;
  touchCue: string;
  gentleCue: string;
  crushCue: string;
  voiceIntro: string;
  voiceTouch: string;
  voiceActivate: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const MAGIC_TOUCH_THEME: MagicTouchTheme = {
  title: 'Crystal Whisper Realm',
  subtitle: 'Gently touch each glowing crystal with feather-light magic pressure!',
  emoji: '✨',
  hero: '🪄',
  accent: '#A78BFA',
  accentDeep: '#7C3AED',
  crystal: '#E9D5FF',
  wand: '#FDE68A',
  glow: 'rgba(167,139,250,0.55)',
  bgGradient: ['#1A0A2E', '#3D1A6E', '#6D28D9', '#C4B5FD'],
  decor: ['✨', '🔮', '🌙', '⭐', '🪄', '💫'],
  crystals: ['🔮', '💎', '✨', '🌟', '💠', '🔮', '💎', '✨'],
  hintText: 'Reach out gently and touch the crystal — light as a feather, not too hard!',
  positionCue: 'Step back so the camera sees your arms, hands and upper body clearly.',
  touchCue: 'Touch the crystal!',
  gentleCue: 'Reach a little more — gentle touch!',
  crushCue: 'Too hard! Feather-light touch only!',
  voiceIntro:
    'Welcome to Crystal Whisper Realm! Gently touch each glowing crystal with feather-light magic pressure.',
  voiceTouch: 'Touch now — gentle magic pressure on the crystal!',
  voiceActivate: 'Crystal awakened! Perfect gentle touch!',
  voiceComplete: 'All crystals awakened! You mastered every magic touch with amazing control!',
  congrats: 'Crystal Mage!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export const INFLATE_SHELL = {
  backText: '#BAE6FD',
  backBorder: 'rgba(186,230,253,0.45)',
  statLabel: '#7DD3FC',
  statValue: '#F0F9FF',
  statBorder: 'rgba(125,211,252,0.45)',
  sparkleColor: '#FDE68A',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  academyLabel: 'SKY PUFF WORKSHOP',
} as const;

export type InflateCarefullyTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  balloon: string;
  cloud: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  balloons: string[];
  hintText: string;
  positionCue: string;
  inflateCue: string;
  gentleCue: string;
  easeCue: string;
  popCue: string;
  sealCue: string;
  voiceIntro: string;
  voiceInflate: string;
  voiceSeal: string;
  voicePop: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const INFLATE_CAREFULLY_THEME: InflateCarefullyTheme = {
  title: 'Sky Puff Workshop',
  subtitle: 'Inflate each cloud balloon carefully — stop at the perfect size without popping!',
  emoji: '🎈',
  hero: '☁️',
  accent: '#38BDF8',
  accentDeep: '#0284C7',
  balloon: '#BAE6FD',
  cloud: '#F0F9FF',
  glow: 'rgba(56,189,248,0.5)',
  bgGradient: ['#0C4A6E', '#0369A1', '#38BDF8', '#E0F2FE'],
  decor: ['☁️', '🎈', '💨', '✨', '🌤️', '⭐'],
  balloons: ['🎈', '☁️', '🎈', '💨', '🎈', '☁️', '🎈', '✨'],
  hintText: 'Squeeze and press gently to add air — ease off when the balloon reaches the gold line!',
  positionCue: 'Step back so the camera sees your arms, hands and chest clearly.',
  inflateCue: 'Inflate carefully!',
  gentleCue: 'A little more gentle pressure…',
  easeCue: 'Ease off — almost perfect size!',
  popCue: 'Pop! Too much force — try gentler!',
  sealCue: 'Perfect size — sealing balloon!',
  voiceIntro:
    'Welcome to Sky Puff Workshop! Inflate each cloud balloon carefully and stop at the perfect size without popping!',
  voiceInflate: 'Inflate now — gentle steady pressure!',
  voiceSeal: 'Perfect inflation! Balloon sealed safely!',
  voicePop: 'Oops, it popped! Ease off earlier next time.',
  voiceComplete: 'Workshop complete! You inflated every balloon with amazing careful control!',
  congrats: 'Sky Puff Master!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export const GOLDILOCKS_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.45)',
  statLabel: '#FCD34D',
  statValue: '#FFFBEB',
  statBorder: 'rgba(252,211,77,0.45)',
  sparkleColor: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#F59E0B',
  academyLabel: 'GOLDILOCKS COTTAGE',
} as const;

export type GoldilocksPressureTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  porridge: string;
  bowl: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  bowls: string[];
  bears: string[];
  hintText: string;
  positionCue: string;
  previewCue: string;
  tasteCue: string;
  tooSoftCue: string;
  tooHardCue: string;
  justRightCue: string;
  voiceIntro: string;
  voiceTaste: string;
  voiceJustRight: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const GOLDILOCKS_PRESSURE_THEME: GoldilocksPressureTheme = {
  title: 'Goldilocks Cottage',
  subtitle: 'Taste each bowl of porridge with just-right pressure — not too soft, not too hard!',
  emoji: '🥣',
  hero: '🐻',
  accent: '#F59E0B',
  accentDeep: '#B45309',
  porridge: '#FDE68A',
  bowl: '#FEF3C7',
  glow: 'rgba(245,158,11,0.5)',
  bgGradient: ['#451A03', '#78350F', '#D97706', '#FDE68A'],
  decor: ['🏠', '🌲', '🥄', '✨', '🍯', '🐻'],
  bowls: ['🥣', '🍯', '🥣', '🍲', '🥣', '🍯', '🥣', '🍲'],
  bears: ['🐻', '🐻‍❄️', '🐻', '🧸', '🐻', '🐻‍❄️', '🐻', '🧸'],
  hintText: 'Press with just-right force to taste Baby Bear\'s perfect porridge bowl!',
  positionCue: 'Step back so the camera sees your arms, hands and upper body clearly.',
  previewCue: 'Study the just-right bowl — remember the pressure!',
  tasteCue: 'Taste the porridge!',
  tooSoftCue: 'Too soft! Papa Bear\'s bowl — press a little more.',
  tooHardCue: 'Too hard! Mama Bear\'s bowl — ease off gently.',
  justRightCue: 'Just right! Baby Bear\'s perfect porridge!',
  voiceIntro:
    'Welcome to Goldilocks Cottage! Taste each bowl with just-right pressure — not too soft, not too hard!',
  voiceTaste: 'Taste now — find Baby Bear\'s just-right pressure!',
  voiceJustRight: 'Just right! Perfect porridge pressure!',
  voiceComplete: 'Cottage complete! You found just-right pressure on every bowl!',
  congrats: 'Just-Right Champion!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};
