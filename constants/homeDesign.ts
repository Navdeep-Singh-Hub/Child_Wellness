/**
 * Home screen design system — Warm Aurora Sanctuary
 * Sensory-friendly, child-wellness focused, premium but calm.
 */
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

export const HOME_LAYOUT = {
  screenWidth: SCREEN_W,
  horizontalPad: 20,
  sectionGap: 36,
  cardRadius: 28,
  cardRadiusSm: 20,
  statTileWidth: (SCREEN_W - 52) / 2,
  quickActionWidth: 148,
  isCompact: SCREEN_W < 380,
} as const;

/** Core palette — 60-30-10 rule: neutral base, soft secondary, vivid accents */
export const HOME_COLORS = {
  ink: '#0C1222',
  inkSoft: '#334155',
  inkMuted: '#64748B',
  inkFaint: '#94A3B8',
  surface: '#FFFFFF',
  surfaceGlass: 'rgba(255, 255, 255, 0.72)',
  surfaceGlassStrong: 'rgba(255, 255, 255, 0.88)',
  border: 'rgba(255, 255, 255, 0.65)',
  borderSubtle: 'rgba(148, 163, 184, 0.22)',

  coral: '#FF6B6B',
  coralDeep: '#E85555',
  teal: '#2DD4BF',
  tealDeep: '#0D9488',
  violet: '#8B5CF6',
  violetDeep: '#6D28D9',
  amber: '#FBBF24',
  amberDeep: '#D97706',
  rose: '#FB7185',
  sky: '#38BDF8',
  indigo: '#4F46E5',

  mesh1: '#FFF5F5',
  mesh2: '#F0FDFA',
  mesh3: '#EEF2FF',
  mesh4: '#FFFBEB',
} as const;

export const HOME_GRADIENTS = {
  page: ['#FFF8F6', '#F0FDFA', '#EEF2FF', '#FFFBEB'] as const,
  hero: ['#1E1B4B', '#312E81', '#4338CA'] as const,
  heroGlow: ['rgba(139, 92, 246, 0.35)', 'rgba(45, 212, 191, 0.2)', 'transparent'] as const,
  journey: ['#0F766E', '#14B8A6', '#2DD4BF', '#5EEAD4'] as const,
  journeyShine: ['transparent', 'rgba(255,255,255,0.25)', 'transparent'] as const,
  ctaPublic: ['#4F46E5', '#7C3AED', '#EC4899'] as const,
} as const;

export const HOME_TYPE = {
  display: { fontSize: HOME_LAYOUT.isCompact ? 30 : 34, fontWeight: '900' as const, letterSpacing: -1.2 },
  h1: { fontSize: 26, fontWeight: '900' as const, letterSpacing: -0.8 },
  h2: { fontSize: 20, fontWeight: '800' as const, letterSpacing: -0.4 },
  h3: { fontSize: 17, fontWeight: '800' as const },
  body: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  micro: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.6 },
  stat: { fontSize: 32, fontWeight: '900' as const, letterSpacing: -1 },
} as const;

export const HOME_SHADOW = {
  soft: {
    shadowColor: '#0C1222',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  lift: {
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 10,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 8,
  }),
} as const;

export type HomeStatKey = 'xp' | 'coins' | 'streak' | 'hearts';

export type HomeStatTheme = {
  key: HomeStatKey;
  title: string;
  caption: string;
  icon: string;
  accent: string;
  gradient: [string, string, string];
  pattern: 'bolt' | 'coin' | 'flame' | 'heart';
  identity: string;
};

export const HOME_STAT_THEMES: Record<HomeStatKey, Omit<HomeStatTheme, 'key'>> = {
  xp: {
    title: 'XP',
    caption: 'Experience earned',
    icon: 'flash',
    accent: HOME_COLORS.violet,
    gradient: ['#EDE9FE', '#DDD6FE', '#C4B5FD'],
    pattern: 'bolt',
    identity: 'Energy crystal',
  },
  coins: {
    title: 'Coins',
    caption: 'Rewards collected',
    icon: 'diamond',
    accent: HOME_COLORS.amber,
    gradient: ['#FEF9C3', '#FDE68A', '#FCD34D'],
    pattern: 'coin',
    identity: 'Treasure vault',
  },
  streak: {
    title: 'Streak',
    caption: 'Days in a row',
    icon: 'flame',
    accent: HOME_COLORS.coral,
    gradient: ['#FFEDD5', '#FED7AA', '#FDBA74'],
    pattern: 'flame',
    identity: 'Ember trail',
  },
  hearts: {
    title: 'Lives',
    caption: 'Hearts remaining',
    icon: 'heart',
    accent: HOME_COLORS.rose,
    gradient: ['#FFE4E6', '#FECDD3', '#FDA4AF'],
    pattern: 'heart',
    identity: 'Care shield',
  },
};

export type HomeQuickActionKey = 'play' | 'aac' | 'smart' | 'profile' | 'matcher';

export type HomeQuickActionTheme = {
  key: HomeQuickActionKey;
  label: string;
  caption: string;
  icon: string;
  gradient: [string, string];
  accentGlow: string;
  shape: 'arcade' | 'grid' | 'compass' | 'profile' | 'sound';
};

export const HOME_QUICK_ACTIONS: HomeQuickActionTheme[] = [
  {
    key: 'play',
    label: 'Play',
    caption: 'Therapy games',
    icon: 'game-controller',
    gradient: ['#7C3AED', '#5B21B6'],
    accentGlow: '#A78BFA',
    shape: 'arcade',
  },
  {
    key: 'aac',
    label: 'AAC Grid',
    caption: 'Communicate',
    icon: 'grid',
    gradient: ['#0891B2', '#0E7490'],
    accentGlow: '#22D3EE',
    shape: 'grid',
  },
  {
    key: 'smart',
    label: 'Explorer',
    caption: 'Discover',
    icon: 'compass',
    gradient: ['#059669', '#047857'],
    accentGlow: '#34D399',
    shape: 'compass',
  },
  {
    key: 'profile',
    label: 'Profile',
    caption: 'Your space',
    icon: 'person-circle',
    gradient: ['#DB2777', '#BE185D'],
    accentGlow: '#F472B6',
    shape: 'profile',
  },
  {
    key: 'matcher',
    label: 'Matcher',
    caption: 'Sound & match',
    icon: 'musical-notes',
    gradient: ['#4F46E5', '#3730A3'],
    accentGlow: '#818CF8',
    shape: 'sound',
  },
];

export type HomeMoodKey = 'energetic' | 'focused' | 'relaxed' | 'celebrating';

export const HOME_MOODS: Record<
  HomeMoodKey,
  { emoji: string; label: string; color: string; gradient: [string, string]; hint: string }
> = {
  energetic: {
    emoji: '⚡',
    label: 'Energetic',
    color: '#EA580C',
    gradient: ['#FFF7ED', '#FFEDD5'],
    hint: 'High-energy games & movement',
  },
  focused: {
    emoji: '🎯',
    label: 'Focused',
    color: '#7C3AED',
    gradient: ['#F5F3FF', '#EDE9FE'],
    hint: 'Precision & attention tasks',
  },
  relaxed: {
    emoji: '🍃',
    label: 'Relaxed',
    color: '#0D9488',
    gradient: ['#F0FDFA', '#CCFBF1'],
    hint: 'Calm pacing & gentle play',
  },
  celebrating: {
    emoji: '🎉',
    label: 'Joyful',
    color: '#DB2777',
    gradient: ['#FDF2F8', '#FCE7F3'],
    hint: 'Celebrate wins & milestones',
  },
};

export function getTimeGreeting(firstName?: string | null): { headline: string; subline: string } {
  const hour = new Date().getHours();
  const name = firstName?.trim();
  const who = name ? name : 'there';

  if (hour < 12) {
    return {
      headline: `Good morning, ${who}`,
      subline: 'A fresh start — pick up your journey',
    };
  }
  if (hour < 17) {
    return {
      headline: `Good afternoon, ${who}`,
      subline: 'You’re doing great — keep exploring',
    };
  }
  return {
    headline: `Good evening, ${who}`,
    subline: 'Wind down with a calm session',
  };
}

export const HOME_PLATFORM = {
  topInset: Platform.OS === 'ios' ? 8 : 16,
  scrollTopPad: Platform.OS === 'ios' ? 12 : 20,
} as const;
