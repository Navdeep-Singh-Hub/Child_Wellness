/**
 * Therapy Progress — Realm Atlas design system
 * Each therapy path has its own chromatic world, motif, and typography voice.
 */
import { Dimensions } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

export const TP_LAYOUT = {
  screenWidth: SCREEN_W,
  horizontalPad: 20,
  cardGap: 16,
  cardRadius: 26,
  cardRadiusSm: 18,
  cardMinHeight: 168,
  gridItemWidth: (SCREEN_W - 52) / 2,
  isCompact: SCREEN_W < 380,
} as const;

export const TP_COLORS = {
  page: '#F4F1EC',
  pageDeep: '#E8E4DC',
  ink: '#0F172A',
  inkSoft: '#334155',
  inkMuted: '#64748B',
  inkFaint: '#94A3B8',
  glass: 'rgba(255, 255, 255, 0.78)',
  glassBorder: 'rgba(255, 255, 255, 0.55)',
} as const;

export const TP_TYPE = {
  display: { fontSize: TP_LAYOUT.isCompact ? 28 : 32, fontWeight: '900' as const, letterSpacing: -1.1 },
  h1: { fontSize: 24, fontWeight: '900' as const, letterSpacing: -0.6 },
  h2: { fontSize: 18, fontWeight: '800' as const, letterSpacing: -0.3 },
  body: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.4 },
  micro: { fontSize: 10, fontWeight: '800' as const, letterSpacing: 1.2 },
  cardTitle: { fontSize: 17, fontWeight: '900' as const, letterSpacing: -0.4 },
  cardDesc: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
} as const;

export const TP_SHADOW = {
  card: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
  }),
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
} as const;

export type TherapyId =
  | 'speech'
  | 'occupational'
  | 'special-education'
  | 'daily-activities'
  | 'therapy-avatar';

export type TherapyPattern =
  | 'soundwave'
  | 'tactile'
  | 'constellation'
  | 'storybook'
  | 'hologram';

export type TherapyIdentity = {
  id: TherapyId;
  label: string;
  desc: string;
  realm: string;
  tagline: string;
  icon: string;
  accent: string;
  accentGlow: string;
  gradient: [string, string, string];
  gradientSoft: [string, string];
  surfaceTint: string;
  inkOnCard: string;
  inkMutedOnCard: string;
  pattern: TherapyPattern;
  badgeLabel: string;
  external?: boolean;
};

export const THERAPY_IDENTITIES: Record<TherapyId, TherapyIdentity> = {
  speech: {
    id: 'speech',
    label: 'Speech Therapy',
    desc: 'Improve communication and speech skills',
    realm: 'Voice Wave Studio',
    tagline: 'Sound · rhythm · expression',
    icon: 'mic',
    accent: '#6366F1',
    accentGlow: '#A5B4FC',
    gradient: ['#1E1B4B', '#4338CA', '#6366F1'],
    gradientSoft: ['#EEF2FF', '#E0E7FF'],
    surfaceTint: '#EEF2FF',
    inkOnCard: '#FFFFFF',
    inkMutedOnCard: 'rgba(255,255,255,0.82)',
    pattern: 'soundwave',
    badgeLabel: 'VOCAL',
  },
  occupational: {
    id: 'occupational',
    label: 'Occupational Therapy',
    desc: 'Develop daily living and motor skills',
    realm: 'Hands Workshop',
    tagline: 'Touch · grip · movement',
    icon: 'hand-left',
    accent: '#059669',
    accentGlow: '#6EE7B7',
    gradient: ['#064E3B', '#047857', '#10B981'],
    gradientSoft: ['#ECFDF5', '#D1FAE5'],
    surfaceTint: '#ECFDF5',
    inkOnCard: '#FFFFFF',
    inkMutedOnCard: 'rgba(255,255,255,0.85)',
    pattern: 'tactile',
    badgeLabel: 'MOTOR',
  },
  'special-education': {
    id: 'special-education',
    label: 'Special Education',
    desc: 'Educational activities tailored for special needs',
    realm: 'Learning Constellation',
    tagline: 'Discover · practice · grow',
    icon: 'school',
    accent: '#7C3AED',
    accentGlow: '#C4B5FD',
    gradient: ['#4C1D95', '#6D28D9', '#A78BFA'],
    gradientSoft: ['#F5F3FF', '#EDE9FE'],
    surfaceTint: '#F5F3FF',
    inkOnCard: '#FFFFFF',
    inkMutedOnCard: 'rgba(255,255,255,0.85)',
    pattern: 'constellation',
    badgeLabel: 'LEARN',
  },
  'daily-activities': {
    id: 'daily-activities',
    label: 'Social Stories',
    desc: 'Learn through animated social stories',
    realm: 'Storybook Garden',
    tagline: 'Feel · relate · understand',
    icon: 'book',
    accent: '#DB2777',
    accentGlow: '#F9A8D4',
    gradient: ['#831843', '#BE185D', '#F472B6'],
    gradientSoft: ['#FDF2F8', '#FCE7F3'],
    surfaceTint: '#FDF2F8',
    inkOnCard: '#FFFFFF',
    inkMutedOnCard: 'rgba(255,255,255,0.88)',
    pattern: 'storybook',
    badgeLabel: 'STORY',
  },
  'therapy-avatar': {
    id: 'therapy-avatar',
    label: 'Therapy Avatar',
    desc: 'Interactive avatar-based learning',
    realm: 'Digital Companion',
    tagline: 'Play · mirror · connect',
    icon: 'happy',
    accent: '#0284C7',
    accentGlow: '#7DD3FC',
    gradient: ['#0C4A6E', '#0369A1', '#38BDF8'],
    gradientSoft: ['#F0F9FF', '#E0F2FE'],
    surfaceTint: '#F0F9FF',
    inkOnCard: '#FFFFFF',
    inkMutedOnCard: 'rgba(255,255,255,0.88)',
    pattern: 'hologram',
    badgeLabel: 'AVATAR',
    external: true,
  },
};

/** Ordered list for the adventures grid */
export const THERAPIES = Object.values(THERAPY_IDENTITIES);

export function getTherapyIdentity(id: string): TherapyIdentity {
  return THERAPY_IDENTITIES[id as TherapyId] ?? THERAPY_IDENTITIES.speech;
}

export function lightenHex(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 0xff) + (255 - ((n >> 16) & 0xff)) * factor);
  const g = Math.min(255, ((n >> 8) & 0xff) + (255 - ((n >> 8) & 0xff)) * factor);
  const b = Math.min(255, (n & 0xff) + (255 - (n & 0xff)) * factor);
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

export type ViewMode = 'therapies' | 'levels' | 'sessions';

export function getHeaderCopy(mode: ViewMode): { title: string; subtitle: string } {
  switch (mode) {
    case 'therapies':
      return {
        title: 'Your Adventures',
        subtitle: 'Each path has its own world — pick where to explore next.',
      };
    case 'levels':
      return {
        title: 'Choose Your Level',
        subtitle: 'Every level has its own stage — master one to unlock the next.',
      };
    case 'sessions':
      return {
        title: 'Pick a Session',
        subtitle: 'Each session is a new chapter with its own color world.',
      };
  }
}
