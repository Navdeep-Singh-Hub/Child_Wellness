/**
 * OT Level 6 · Session 8 — "Jungle Expedition (Animal Walks & Core Activation)"
 * Visual tokens. A deep emerald-jungle base lifting into lime and warm gold —
 * earthy and adventurous, distinct from the other sessions. Each animal walk
 * also carries its own accent (honey gold, beach sand, ice blue, jungle green,
 * gorilla bronze).
 */

export type AnimalMode = 'bearWalk' | 'crabWalk' | 'sealPush' | 'turtleCrawl' | 'gorillaMarch';

export const SAFARI_SHELL = {
  gradient: ['#022C22', '#065F46', '#15803D', '#FACC15'] as [string, string, string, string],
  backText: '#D9F99D',
  backBorder: 'rgba(217,249,157,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#BBF7D0',
  statLabel: '#86EFAC',
  statValue: '#FDE68A',
  statBorder: 'rgba(134,239,172,0.35)',
  stageBorder: 'rgba(132,204,22,0.45)',
  stageBg: 'rgba(2,44,34,0.5)',
  gold: '#FACC15',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#BEF264',
} as const;

export type AnimalGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  collectible: string;
  /** Require a lowered quadruped position (hands & feet on floor). */
  requireLowered: boolean;
  /** Detect cadence from alternating leg lifts (marching) instead of motion bursts. */
  useLegMarch: boolean;
  /** Reward slow, controlled cadence (turtle). */
  slow: boolean;
  /** Number of trail markers to travel. */
  steps: number;
  hintText: string;
  positionCue: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
};

export const ANIMAL_GAME_THEMES: Record<AnimalMode, AnimalGameTheme> = {
  bearWalk: {
    title: 'Bear Walk Adventure',
    subtitle: 'Walk on hands and feet through the forest collecting honey!',
    emoji: '🐻',
    hero: '🐻',
    accent: '#F59E0B',
    accentDeep: '#92400E',
    glow: 'rgba(245,158,11,0.5)',
    collectible: '🍯',
    requireLowered: true,
    useLegMarch: false,
    slow: false,
    steps: 8,
    hintText: 'Hands and feet on the floor — walk like a strong bear!',
    positionCue: 'Get down on your hands and feet like a bear!',
    voiceIntro: 'Become a mighty bear! Walk on your hands and feet to find honey!',
    voiceComplete: 'What a strong bear! You collected all the honey!',
    congrats: 'Mighty Bear Explorer!',
  },
  crabWalk: {
    title: 'Crab Walk Challenge',
    subtitle: 'Crab walk across the beach between the markers!',
    emoji: '🦀',
    hero: '🦀',
    accent: '#22D3EE',
    accentDeep: '#0E7490',
    glow: 'rgba(34,211,238,0.5)',
    collectible: '🐚',
    requireLowered: true,
    useLegMarch: false,
    slow: false,
    steps: 8,
    hintText: 'Sit back on your hands and feet — scuttle like a crab!',
    positionCue: 'Get into your crab position — tummy up, hands and feet down!',
    voiceIntro: 'Scuttle like a crab across the sunny beach!',
    voiceComplete: 'Super scuttling! You crossed the whole beach!',
    congrats: 'Champion Beach Crab!',
  },
  sealPush: {
    title: 'Seal Push',
    subtitle: 'Push forward with your arms and slide across the ice!',
    emoji: '🦭',
    hero: '🦭',
    accent: '#60A5FA',
    accentDeep: '#1E40AF',
    glow: 'rgba(96,165,250,0.5)',
    collectible: '🐟',
    requireLowered: true,
    useLegMarch: false,
    slow: false,
    steps: 7,
    hintText: 'Lie low and push with your arms to slide like a seal!',
    positionCue: 'Lie on your tummy and push up with your strong arms!',
    voiceIntro: 'Slide like a seal! Push with your arms across the ice!',
    voiceComplete: 'Wonderful pushing! You slid all the way across!',
    congrats: 'Sliding Seal Star!',
  },
  turtleCrawl: {
    title: 'Turtle Crawl',
    subtitle: 'Crawl slowly and steadily along the jungle path!',
    emoji: '🐢',
    hero: '🐢',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.5)',
    collectible: '🍃',
    requireLowered: true,
    useLegMarch: false,
    slow: true,
    steps: 8,
    hintText: 'Slow and steady — crawl on hands and knees like a turtle.',
    positionCue: 'Get on your hands and knees, ready to crawl slowly!',
    voiceIntro: 'Crawl slow and steady like a wise turtle through the jungle!',
    voiceComplete: 'Slow and steady wins! What a wonderful turtle crawl!',
    congrats: 'Steady Turtle Traveler!',
  },
  gorillaMarch: {
    title: 'Gorilla March',
    subtitle: 'March with big stomps and lift those knees high!',
    emoji: '🦍',
    hero: '🦍',
    accent: '#A16207',
    accentDeep: '#713F12',
    glow: 'rgba(161,98,7,0.55)',
    collectible: '🍌',
    requireLowered: false,
    useLegMarch: true,
    slow: false,
    steps: 10,
    hintText: 'Big gorilla stomps — lift your knees up high, left and right!',
    positionCue: 'Stand tall and get ready to march like a big gorilla!',
    voiceIntro: 'Stomp like a gorilla! Lift your knees up high and march!',
    voiceComplete: 'Powerful gorilla marching! You stomped all the way!',
    congrats: 'Mighty Gorilla Marcher!',
  },
};
