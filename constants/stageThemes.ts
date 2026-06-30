/**
 * Stage themes — each level & session gets its own chromatic identity.
 * Speech levels use skill-based palettes; others rotate a curated spectrum.
 */
import type { TherapyId } from '@/constants/therapyProgressDesign';
import { getTherapyIdentity } from '@/constants/therapyProgressDesign';

export type StagePattern =
  | 'focus'
  | 'mirror'
  | 'jaw'
  | 'voice'
  | 'oral'
  | 'motor'
  | 'coordination'
  | 'spark'
  | 'bloom'
  | 'peak'
  | 'pulse'
  | 'orbit';

export type StageTheme = {
  stageNumber: number;
  label: string;
  realm: string;
  tagline: string;
  icon: string;
  accent: string;
  gradient: [string, string, string];
  pattern: StagePattern;
  badge: string;
};

const SPEECH_LEVEL_THEMES: Record<number, Omit<StageTheme, 'stageNumber' | 'badge'>> = {
  1: {
    label: 'Attention & following',
    realm: 'Focus Gateway',
    tagline: 'Watch · wait · respond',
    icon: 'eye',
    accent: '#D97706',
    gradient: ['#78350F', '#B45309', '#FBBF24'],
    pattern: 'focus',
  },
  2: {
    label: 'Imitation, body & words',
    realm: 'Mirror Meadow',
    tagline: 'Copy · move · repeat',
    icon: 'copy',
    accent: '#0D9488',
    gradient: ['#134E4A', '#0F766E', '#2DD4BF'],
    pattern: 'mirror',
  },
  3: {
    label: 'Jaw & mouth opening',
    realm: 'Jaw Journey',
    tagline: 'Open · stretch · relax',
    icon: 'happy-outline',
    accent: '#EA580C',
    gradient: ['#7C2D12', '#C2410C', '#FB923C'],
    pattern: 'jaw',
  },
  4: {
    label: 'Voice & speech sounds',
    realm: 'Voice Valley',
    tagline: 'Hum · call · echo',
    icon: 'volume-high',
    accent: '#4F46E5',
    gradient: ['#312E81', '#4338CA', '#818CF8'],
    pattern: 'voice',
  },
  5: {
    label: 'Pre-oral & mouth skills',
    realm: 'Oral Orchard',
    tagline: 'Lips · tongue · breath',
    icon: 'water',
    accent: '#DB2777',
    gradient: ['#831843', '#BE185D', '#F472B6'],
    pattern: 'oral',
  },
  6: {
    label: 'Speech motor readiness',
    realm: 'Motor Mountain',
    tagline: 'Build · strengthen · prepare',
    icon: 'fitness',
    accent: '#059669',
    gradient: ['#064E3B', '#047857', '#34D399'],
    pattern: 'motor',
  },
  7: {
    label: 'Oral motor coordination',
    realm: 'Coordination Cove',
    tagline: 'Sync · flow · combine',
    icon: 'git-network',
    accent: '#0284C7',
    gradient: ['#0C4A6E', '#0369A1', '#38BDF8'],
    pattern: 'coordination',
  },
};

const GENERIC_STAGE_PALETTE: Omit<StageTheme, 'stageNumber' | 'badge' | 'label'>[] = [
  { realm: 'Sunrise Stage', tagline: 'Begin · explore · learn', icon: 'sunny', accent: '#D97706', gradient: ['#78350F', '#B45309', '#FCD34D'], pattern: 'spark' },
  { realm: 'Ocean Stage', tagline: 'Flow · drift · discover', icon: 'water', accent: '#0891B2', gradient: ['#164E63', '#0E7490', '#22D3EE'], pattern: 'pulse' },
  { realm: 'Forest Stage', tagline: 'Grow · climb · reach', icon: 'leaf', accent: '#059669', gradient: ['#064E3B', '#047857', '#6EE7B7'], pattern: 'bloom' },
  { realm: 'Cosmos Stage', tagline: 'Wonder · imagine · soar', icon: 'planet', accent: '#7C3AED', gradient: ['#4C1D95', '#6D28D9', '#C4B5FD'], pattern: 'orbit' },
  { realm: 'Ember Stage', tagline: 'Warm · try · shine', icon: 'flame', accent: '#E11D48', gradient: ['#881337', '#BE123C', '#FB7185'], pattern: 'spark' },
  { realm: 'Stone Stage', tagline: 'Steady · build · hold', icon: 'cube', accent: '#475569', gradient: ['#1E293B', '#334155', '#94A3B8'], pattern: 'motor' },
  { realm: 'Citrus Stage', tagline: 'Zest · bounce · play', icon: 'nutrition', accent: '#EA580C', gradient: ['#7C2D12', '#C2410C', '#FDBA74'], pattern: 'bloom' },
  { realm: 'Mint Stage', tagline: 'Fresh · calm · focus', icon: 'flower', accent: '#14B8A6', gradient: ['#115E59', '#0D9488', '#5EEAD4'], pattern: 'pulse' },
  { realm: 'Royal Stage', tagline: 'Bold · lead · achieve', icon: 'diamond', accent: '#6D28D9', gradient: ['#4C1D95', '#5B21B6', '#A78BFA'], pattern: 'peak' },
  { realm: 'Coral Stage', tagline: 'Bright · share · connect', icon: 'heart', accent: '#F472B6', gradient: ['#831843', '#DB2777', '#FBCFE8'], pattern: 'bloom' },
];

const SESSION_CHAPTER_NAMES = [
  'Opening Spark',
  'Practice Path',
  'Discovery Lane',
  'Challenge Bridge',
  'Mastery Gate',
  'Skill Summit',
  'Flow River',
  'Victory Vista',
  'Hero Horizon',
  'Champion Crown',
];

const SESSION_TAGLINES = [
  'Warm up · get ready',
  'Repeat · refine',
  'Explore · experiment',
  'Push · persevere',
  'Master · move on',
  'Level up · leap',
  'Flow · fluency',
  'Celebrate · consolidate',
  'Hero mode · go big',
  'Final quest · crown it',
];

function wrapStage(base: Omit<StageTheme, 'stageNumber' | 'badge'>, stageNumber: number, label?: string): StageTheme {
  return {
    ...base,
    stageNumber,
    label: label ?? `Level ${stageNumber}`,
    badge: `L${stageNumber}`,
  };
}

export function getLevelTheme(therapyId: string, levelNumber: number, subtitle?: string | null): StageTheme {
  if (therapyId === 'speech' && SPEECH_LEVEL_THEMES[levelNumber]) {
    const base = SPEECH_LEVEL_THEMES[levelNumber];
    return wrapStage(base, levelNumber, base.label);
  }

  const therapy = getTherapyIdentity(therapyId);
  const palette = GENERIC_STAGE_PALETTE[(levelNumber - 1) % GENERIC_STAGE_PALETTE.length];
  const label = subtitle?.trim() || `Level ${levelNumber}`;
  const realm = `${therapy.realm.split(' ')[0]} · Stage ${levelNumber}`;

  return wrapStage(
    {
      ...palette,
      realm,
      label,
    },
    levelNumber,
    label,
  );
}

export function getSessionTheme(therapyId: string, levelNumber: number, sessionNumber: number): StageTheme {
  const level = getLevelTheme(therapyId, levelNumber);
  const chapterIdx = Math.min(sessionNumber - 1, SESSION_CHAPTER_NAMES.length - 1);
  const hueShift = (sessionNumber - 1) * 18;

  const accent = shiftHexHue(level.accent, hueShift);
  const gradient: [string, string, string] = [
    shiftHexHue(level.gradient[0], hueShift * 0.4),
    shiftHexHue(level.gradient[1], hueShift * 0.6),
    shiftHexHue(level.gradient[2], hueShift * 0.8),
  ];

  const patterns: StagePattern[] = ['spark', 'pulse', 'bloom', 'orbit', 'focus', 'mirror', 'voice', 'motor', 'coordination', 'peak'];
  const pattern = patterns[(sessionNumber - 1) % patterns.length];

  return {
    stageNumber: sessionNumber,
    label: `Session ${sessionNumber}`,
    realm: SESSION_CHAPTER_NAMES[chapterIdx],
    tagline: SESSION_TAGLINES[chapterIdx],
    icon: level.icon,
    accent,
    gradient,
    pattern,
    badge: `S${sessionNumber}`,
  };
}

export function getGameSlotTheme(
  therapyId: string,
  levelNumber: number,
  sessionNumber: number,
  gameIndex: number,
): StageTheme {
  const session = getSessionTheme(therapyId, levelNumber, sessionNumber);
  const slot = gameIndex + 1;
  const accent = shiftHexHue(session.accent, slot * 12);

  return {
    stageNumber: slot,
    label: `Game ${slot}`,
    realm: `Quest ${slot}`,
    tagline: slot === 1 ? 'Start here' : slot === 5 ? 'Final challenge' : 'Keep going',
    icon: ['star', 'flash', 'rocket', 'trophy', 'medal'][slot - 1] ?? 'game-controller',
    accent,
    gradient: [
      shiftHexHue(session.gradient[0], slot * 8),
      shiftHexHue(session.gradient[1], slot * 10),
      shiftHexHue(session.gradient[2], slot * 12),
    ],
    pattern: session.pattern,
    badge: `#${slot}`,
  };
}

function shiftHexHue(hex: string, degrees: number): string {
  const { h, s, l } = hexToHsl(hex);
  const nh = (h + degrees + 360) % 360;
  return hslToHex(nh, s, l);
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 0xff) / 255;
  const g = ((n >> 8) & 0xff) / 255;
  const b = (n & 0xff) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0; let g = 0; let b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getTherapyLabel(therapyId: string): string {
  return getTherapyIdentity(therapyId as TherapyId).label;
}
