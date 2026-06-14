/**
 * OT Level 7 · Session 1 — "Linear Vestibular Movement"
 * Warm railway / adventure palette (deep navy → copper → amber) — distinct from
 * Level 6 violet, forest, space, lagoon and safari themes.
 */

export type VestibularMode = 'trainTracks' | 'rocketLaunch' | 'rainbowRun' | 'waveWalker' | 'adventurePath';

export const VESTIBULAR_SHELL = {
  gradient: ['#0C1929', '#1E3A5F', '#B45309', '#F59E0B'] as [string, string, string, string],
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#FCD34D',
  statLabel: '#FBBF24',
  statValue: '#FEF3C7',
  statBorder: 'rgba(251,191,36,0.4)',
  stageBorder: 'rgba(251,191,36,0.45)',
  stageBg: 'rgba(12,25,41,0.55)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#FDE68A',
} as const;

export const RAINBOW_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7'] as const;

export type VestibularGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  hintText: string;
  positionCue: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
  collectible: string;
  steps: number;
  /** Show rocket power bar instead of standard path. */
  showRocket?: boolean;
  /** Show animated wave floor overlay. */
  showWaves?: boolean;
  /** Rainbow marker sequence. */
  rainbow?: boolean;
};

export const VESTIBULAR_GAME_THEMES: Record<VestibularMode, VestibularGameTheme> = {
  trainTracks: {
    title: 'Train Tracks',
    subtitle: 'Drive the train forward — collect passengers at each station!',
    emoji: '🚂',
    hero: '🚂',
    accent: '#F59E0B',
    accentDeep: '#B45309',
    glow: 'rgba(245,158,11,0.55)',
    hintText: 'Walk forward step by step — stay tall and balanced on the tracks!',
    positionCue: 'Stand tall facing the camera — leave room to walk forward!',
    voiceIntro: 'All aboard! Walk forward along the tracks and collect passengers at each station!',
    voiceComplete: 'You reached every station! What a great train driver!',
    congrats: 'Train Conductor Champion!',
    collectible: '🧑‍🤝‍🧑',
    steps: 8,
  },
  rocketLaunch: {
    title: 'Rocket Launch',
    subtitle: 'Step through launch zones to power the rocket into space!',
    emoji: '🚀',
    hero: '🚀',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.55)',
    hintText: 'Take strong forward steps — each one adds rocket power!',
    positionCue: 'Stand back so I can see your whole body — ready to launch!',
    voiceIntro: 'Help the rocket launch! Step forward through each power zone!',
    voiceComplete: 'Blast off! You powered the rocket all the way to space!',
    congrats: 'Rocket Launch Hero!',
    collectible: '⚡',
    steps: 7,
    showRocket: true,
  },
  rainbowRun: {
    title: 'Rainbow Run',
    subtitle: 'Follow the rainbow path marker by marker to find the treasure!',
    emoji: '🌈',
    hero: '🏃',
    accent: '#A855F7',
    accentDeep: '#7E22CE',
    glow: 'rgba(168,85,247,0.5)',
    hintText: 'Walk to each colorful marker in order — keep your balance!',
    positionCue: 'Face the camera and get ready to follow the rainbow!',
    voiceIntro: 'Follow the rainbow! Walk between each colorful marker to find the treasure!',
    voiceComplete: 'You found the hidden treasure! Beautiful rainbow run!',
    congrats: 'Rainbow Path Explorer!',
    collectible: '💎',
    steps: 6,
    rainbow: true,
  },
  waveWalker: {
    title: 'Wave Walker',
    subtitle: 'Walk across gentle ocean waves — stay balanced as they shift!',
    emoji: '🌊',
    hero: '🐚',
    accent: '#22D3EE',
    accentDeep: '#0E7490',
    glow: 'rgba(34,211,238,0.5)',
    hintText: 'Walk forward steadily — react when the waves get bigger!',
    positionCue: 'Stand tall on your path — the waves are coming!',
    voiceIntro: 'Walk across the ocean waves! Stay balanced as the waves change!',
    voiceComplete: 'You crossed the whole ocean! Steady wave walker!',
    congrats: 'Wave Walking Champion!',
    collectible: '🐚',
    steps: 8,
    showWaves: true,
  },
  adventurePath: {
    title: 'Adventure Path',
    subtitle: 'Explore the jungle trail — follow arrows and movement challenges!',
    emoji: '🏃',
    hero: '🧭',
    accent: '#84CC16',
    accentDeep: '#3F6212',
    glow: 'rgba(132,204,22,0.5)',
    hintText: 'Follow each arrow forward — step with control and balance!',
    positionCue: 'Stand ready at the trail start — whole body visible!',
    voiceIntro: 'Adventure begins! Walk forward along the jungle trail and follow every marker!',
    voiceComplete: 'You finished the jungle trail! Amazing explorer!',
    congrats: 'Trail Explorer Champion!',
    collectible: '🎁',
    steps: 9,
  },
};
