/**
 * OT Level 7 · Session 9 — "Vestibular Endurance"
 * Long-journey palette (forest night → emerald → spring green → sunrise gold).
 */

export type EnduranceMode = 'longTrailWalk' | 'rainbowJourney' | 'forestExplorer' | 'endlessTracks' | 'balanceMarathon';

export const ENDURANCE_SHELL = {
  gradient: ['#052E16', '#047857', '#34D399', '#FBBF24'] as [string, string, string, string],
  backText: '#BBF7D0',
  backBorder: 'rgba(187,247,208,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#86EFAC',
  statLabel: '#34D399',
  statValue: '#FEF3C7',
  statBorder: 'rgba(52,211,153,0.4)',
  stageBorder: 'rgba(52,211,153,0.45)',
  stageBg: 'rgba(5,46,22,0.55)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#86EFAC',
} as const;

export type EnduranceGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
  /** Show the stepping path overlay. */
  showTrail?: boolean;
};

export const ENDURANCE_GAME_THEMES: Record<EnduranceMode, EnduranceGameTheme> = {
  longTrailWalk: {
    title: 'Long Trail Walk',
    subtitle: 'Keep walking and balancing along the long mountain trail!',
    emoji: '🚶',
    hero: '🥾',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.55)',
    hintText: 'Keep moving and stay balanced — go the distance!',
    voiceIntro: 'Let us hike the long trail! Keep moving and stay balanced the whole way!',
    voiceComplete: 'You hiked the whole trail! Amazing endurance!',
    congrats: 'Long Trail Champion!',
    showTrail: true,
  },
  rainbowJourney: {
    title: 'Rainbow Journey',
    subtitle: 'Travel the long colorful rainbow path!',
    emoji: '🌈',
    hero: '🌈',
    accent: '#F472B6',
    accentDeep: '#BE185D',
    glow: 'rgba(244,114,182,0.5)',
    hintText: 'Move along the rainbow and keep your balance to the end!',
    voiceIntro: 'Follow the colorful rainbow path! Keep moving and stay balanced!',
    voiceComplete: 'You traveled the whole rainbow! Beautiful endurance!',
    congrats: 'Rainbow Journey Champion!',
    showTrail: true,
  },
  forestExplorer: {
    title: 'Forest Explorer',
    subtitle: 'Explore the deep forest while keeping posture and balance!',
    emoji: '🏞️',
    hero: '🧭',
    accent: '#22C55E',
    accentDeep: '#15803D',
    glow: 'rgba(34,197,94,0.5)',
    hintText: 'Navigate the forest — keep moving and balancing as you go!',
    voiceIntro: 'Explore the forest! Keep your posture and balance as you navigate!',
    voiceComplete: 'You explored the whole forest! Great stamina!',
    congrats: 'Forest Explorer Champion!',
  },
  endlessTracks: {
    title: 'Endless Tracks',
    subtitle: 'Keep moving through the changing train routes!',
    emoji: '🚂',
    hero: '🚂',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.5)',
    hintText: 'Stay on track — keep moving as the routes change!',
    voiceIntro: 'All aboard! Keep moving through the changing train tracks!',
    voiceComplete: 'You rode the endless tracks! Wonderful endurance!',
    congrats: 'Endless Tracks Champion!',
    showTrail: true,
  },
  balanceMarathon: {
    title: 'Balance Marathon',
    subtitle: 'Complete the longest balance and movement marathon!',
    emoji: '⭐',
    hero: '🏅',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.55)',
    hintText: 'Go the full distance — move, turn and balance all the way!',
    voiceIntro: 'Time for the balance marathon! Complete every challenge to the finish!',
    voiceComplete: 'You finished the marathon! Incredible endurance and balance!',
    congrats: 'Balance Marathon Champion!',
  },
};
