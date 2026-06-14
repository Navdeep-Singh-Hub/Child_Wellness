/**
 * OT Level 6 · Session 4 — "Crystal Lagoon (Static Balance)"
 * Visual tokens. A serene tropical-lagoon palette (deep ocean teal → aqua →
 * mint shallows) with warm coral/gold accents — calm and balance-focused, and
 * visually distinct from S1 violet, S2 forest green, S3 space navy.
 */

export type BalanceMode = 'flamingo' | 'island' | 'statue' | 'starHold' | 'freezeHero';

export const LAGOON_SHELL = {
  gradient: ['#053B4A', '#0E7490', '#14B8A6', '#5EEAD4'] as [string, string, string, string],
  backText: '#CCFBF1',
  backBorder: 'rgba(204,251,241,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#99F6E4',
  statLabel: '#5EEAD4',
  statValue: '#FDE68A',
  statBorder: 'rgba(94,234,212,0.35)',
  stageBorder: 'rgba(94,234,212,0.45)',
  stageBg: 'rgba(5,59,74,0.5)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#5EEAD4',
} as const;

export type BalanceGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  collectible: string;
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
};

export const BALANCE_GAME_THEMES: Record<BalanceMode, BalanceGameTheme> = {
  flamingo: {
    title: 'Flamingo Stand',
    subtitle: 'Stand on one leg like a flamingo and collect fish & stars!',
    emoji: '🦩',
    hero: '🦩',
    accent: '#F472B6',
    accentDeep: '#BE185D',
    glow: 'rgba(244,114,182,0.55)',
    collectible: '🐟',
    hintText: 'Lift one foot and balance like a flamingo — hold steady!',
    voiceIntro: 'Stand on one leg like a flamingo! Hold your balance.',
    voiceComplete: 'Amazing balance! What a graceful flamingo!',
    congrats: 'Flamingo Balance Star!',
  },
  island: {
    title: 'One Foot Island',
    subtitle: 'Balance on each tiny island without stepping off!',
    emoji: '🏝️',
    hero: '🏝️',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.5)',
    collectible: '🌴',
    hintText: 'Stand on one foot and stay on the island — don\u2019t step off!',
    voiceIntro: 'Balance on one foot on each island. Don\u2019t fall in the water!',
    voiceComplete: 'You crossed every island! Super balance!',
    congrats: 'Island Hopper Hero!',
  },
  statue: {
    title: 'Balance Statue',
    subtitle: 'Hold magical poses and stay perfectly still!',
    emoji: '🗿',
    hero: '🗿',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.5)',
    collectible: '✨',
    hintText: 'Hold the pose and freeze like a statue — ignore distractions!',
    voiceIntro: 'Hold the pose and become a still magical statue!',
    voiceComplete: 'Statue-still! You guarded the temple perfectly!',
    congrats: 'Temple Statue Guardian!',
  },
  starHold: {
    title: 'Star Balance Hold',
    subtitle: 'Reach for the stars while you balance on the platform!',
    emoji: '🌟',
    hero: '🌟',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.5)',
    collectible: '⭐',
    hintText: 'Stretch your arms out to the stars and hold your balance!',
    voiceIntro: 'Reach your arms to the stars and hold steady!',
    voiceComplete: 'You collected all the stars! Strong and steady!',
    congrats: 'Star Reacher Champion!',
  },
  freezeHero: {
    title: 'Freeze Hero',
    subtitle: 'Move like a hero — then freeze and balance when danger appears!',
    emoji: '🦸',
    hero: '🦸',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.5)',
    collectible: '🛡️',
    hintText: 'Move around, then FREEZE and balance the instant you\u2019re signaled!',
    voiceIntro: 'Move like a hero, then freeze and balance when danger comes!',
    voiceComplete: 'Heroic freezes! Your balance saved the day!',
    congrats: 'Freeze Balance Hero!',
  },
};
