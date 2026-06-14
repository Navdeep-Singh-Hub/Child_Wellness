/**
 * OT Level 7 · Session 7 — "Balance Reactions"
 * Superhero-surf palette (storm navy → ocean teal → surf cyan → hero gold).
 */

export type ReactionMode = 'freezeBalance' | 'waveRider' | 'surfChallenge' | 'obstacleBalance' | 'recoveryMaster';

export const REACTION_SHELL = {
  gradient: ['#0F172A', '#155E75', '#06B6D4', '#FBBF24'] as [string, string, string, string],
  backText: '#A5F3FC',
  backBorder: 'rgba(165,243,252,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#67E8F9',
  statLabel: '#22D3EE',
  statValue: '#FEF3C7',
  statBorder: 'rgba(34,211,238,0.4)',
  stageBorder: 'rgba(34,211,238,0.45)',
  stageBg: 'rgba(15,23,42,0.55)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#67E8F9',
} as const;

export type ReactionGameTheme = {
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

export const REACTION_GAME_THEMES: Record<ReactionMode, ReactionGameTheme> = {
  freezeBalance: {
    title: 'Freeze Balance',
    subtitle: 'Move like a superhero — then FREEZE when danger appears!',
    emoji: '⚡',
    hero: '🦸',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.55)',
    hintText: 'Move when it says GO — freeze instantly and balance when it says STOP!',
    voiceIntro: 'Superhero, move around! When danger appears, freeze and balance right away!',
    voiceComplete: 'Incredible reactions! You froze like a true superhero!',
    congrats: 'Freeze Balance Hero!',
  },
  waveRider: {
    title: 'Wave Rider',
    subtitle: 'Ride the ocean waves — shift your weight to stay balanced!',
    emoji: '🌊',
    hero: '🏄',
    accent: '#22D3EE',
    accentDeep: '#0E7490',
    glow: 'rgba(34,211,238,0.5)',
    hintText: 'Lean with each wave — shift your weight and keep your balance!',
    voiceIntro: 'Ride the waves! Shift your weight side to side and stay balanced!',
    voiceComplete: 'You rode every wave! Awesome balance adjustments!',
    congrats: 'Wave Rider Champion!',
    showTrail: true,
  },
  surfChallenge: {
    title: 'Surf Challenge',
    subtitle: 'Recover fast from sudden changes — stay upright on the board!',
    emoji: '🏄',
    hero: '🏄‍♂️',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.5)',
    hintText: 'React fast to sudden changes and recover your balance quickly!',
    voiceIntro: 'Surf adventure! Respond fast to sudden changes and stay upright!',
    voiceComplete: 'Amazing recoveries! You conquered the surf challenge!',
    congrats: 'Surf Challenge Champion!',
  },
  obstacleBalance: {
    title: 'Obstacle Balance',
    subtitle: 'Step around obstacles while keeping perfect control!',
    emoji: '🚧',
    hero: '🚶',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.5)',
    hintText: 'Step around each obstacle and steady your balance after every move!',
    voiceIntro: 'Cross the path! Step around the obstacles and stay in control!',
    voiceComplete: 'You cleared every obstacle! Brilliant balance control!',
    congrats: 'Obstacle Balance Champion!',
    showTrail: true,
  },
  recoveryMaster: {
    title: 'Recovery Master',
    subtitle: 'Combine every balance skill to become the Balance Champion!',
    emoji: '🏆',
    hero: '🏆',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.55)',
    hintText: 'Follow every cue — move, freeze, turn and recover with great balance!',
    voiceIntro: 'Time to become the Balance Champion! Follow every challenge and recover with control!',
    voiceComplete: 'You are the Balance Champion! Outstanding performance!',
    congrats: 'Balance Champion!',
  },
};
