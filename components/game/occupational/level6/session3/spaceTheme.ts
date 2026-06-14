/**
 * OT Level 6 · Session 3 — "Cosmic Voyager (Head & Neck Stability)"
 * Visual tokens. A deep starlit-space palette (midnight navy → nebula purple →
 * aurora teal) with bright cyan/gold star accents — calm, focused, and distinct
 * from S1 (superhero violet) and S2 (forest green).
 */

export type HeadMode = 'rocketWatch' | 'lookHold' | 'skyGround' | 'keepCrown' | 'starTracker';

export const SPACE_SHELL = {
  gradient: ['#060A1F', '#15183C', '#2A2A6E', '#3B82A6'] as [string, string, string, string],
  backText: '#CFFAFE',
  backBorder: 'rgba(207,250,254,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#A5B4FC',
  statLabel: '#67E8F9',
  statValue: '#FDE68A',
  statBorder: 'rgba(103,232,249,0.35)',
  stageBorder: 'rgba(103,232,249,0.45)',
  stageBg: 'rgba(6,10,31,0.55)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#67E8F9',
  glassBorder: 'rgba(165,180,252,0.4)',
} as const;

export type HeadGameTheme = {
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
};

export const HEAD_GAME_THEMES: Record<HeadMode, HeadGameTheme> = {
  rocketWatch: {
    title: 'Rocket Watch',
    subtitle: 'Follow the rocket with your head — keep your body still!',
    emoji: '🚀',
    hero: '🚀',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.55)',
    hintText: 'Move only your head to follow the rocket — body stays still!',
    voiceIntro: 'Follow the rocket with your head! Keep your shoulders still.',
    voiceComplete: 'Amazing tracking! You followed the rocket everywhere!',
    congrats: 'Rocket Watcher!',
  },
  lookHold: {
    title: 'Look & Hold',
    subtitle: 'Lookout duty! Hold each look — left, right, up, down.',
    emoji: '🏰',
    hero: '🔭',
    accent: '#F59E0B',
    accentDeep: '#B45309',
    glow: 'rgba(245,158,11,0.5)',
    hintText: 'Turn your head where the command says — and hold it steady!',
    voiceIntro: 'Lookout! Follow the commands and hold each look.',
    voiceComplete: 'Sharp lookout! The castle is safe!',
    congrats: 'Castle Lookout Hero!',
  },
  skyGround: {
    title: 'Sky-Ground Explorer',
    subtitle: 'Look up at the clouds, then down at the flowers!',
    emoji: '🌤️',
    hero: '🧭',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.5)',
    hintText: 'Look UP at the clouds, then DOWN at the flowers — body still!',
    voiceIntro: 'Look up at the clouds, then down at the flowers!',
    voiceComplete: 'Wonderful exploring up and down!',
    congrats: 'Sky-Ground Explorer!',
  },
  keepCrown: {
    title: 'Keep The Crown',
    subtitle: 'Turn your head smoothly without dropping the crown!',
    emoji: '👑',
    hero: '👑',
    accent: '#F472B6',
    accentDeep: '#BE185D',
    glow: 'rgba(244,114,182,0.5)',
    hintText: 'Turn your head SLOWLY and smoothly — keep the crown balanced!',
    voiceIntro: 'Turn your head smoothly so the crown stays on top!',
    voiceComplete: 'The crown never fell! Beautifully smooth!',
    congrats: 'Smooth Crown Keeper!',
  },
  starTracker: {
    title: 'Star Tracker',
    subtitle: 'Follow the shooting stars across the night sky!',
    emoji: '🌟',
    hero: '✨',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.55)',
    hintText: 'Smoothly follow each star with your head — all the way!',
    voiceIntro: 'Follow the shooting stars with your head across the sky!',
    voiceComplete: 'Stellar tracking! You followed every star!',
    congrats: 'Master Star Tracker!',
  },
};
