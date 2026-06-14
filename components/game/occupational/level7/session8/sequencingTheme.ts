/**
 * OT Level 7 · Session 8 — "Vestibular Sequencing"
 * Adventure-quest palette (midnight plum → royal violet → magenta → treasure gold).
 */

export type SequencingMode = 'followMySteps' | 'movementPatternCopy' | 'starSequencePath' | 'spaceMission' | 'pirateJourney';

export const SEQUENCING_SHELL = {
  gradient: ['#1E1B4B', '#5B21B6', '#C026D3', '#FBBF24'] as [string, string, string, string],
  backText: '#E9D5FF',
  backBorder: 'rgba(233,213,255,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#D8B4FE',
  statLabel: '#C084FC',
  statValue: '#FEF3C7',
  statBorder: 'rgba(192,132,252,0.4)',
  stageBorder: 'rgba(192,132,252,0.45)',
  stageBg: 'rgba(30,27,75,0.55)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#D8B4FE',
} as const;

export type SequencingGameTheme = {
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

export const SEQUENCING_GAME_THEMES: Record<SequencingMode, SequencingGameTheme> = {
  followMySteps: {
    title: 'Follow My Steps',
    subtitle: 'Follow the footstep markers across the floor in order!',
    emoji: '👣',
    hero: '🧒',
    accent: '#C084FC',
    accentDeep: '#7E22CE',
    glow: 'rgba(192,132,252,0.55)',
    hintText: 'Step to each marker in the right order and keep your balance!',
    voiceIntro: 'Follow my steps! Move to each footprint in order and stay balanced!',
    voiceComplete: 'You followed every step! Wonderful movement planning!',
    congrats: 'Follow My Steps Champion!',
    showTrail: true,
  },
  movementPatternCopy: {
    title: 'Movement Pattern Copy',
    subtitle: 'Copy each movement pattern — they get trickier!',
    emoji: '🎯',
    hero: '🎯',
    accent: '#F472B6',
    accentDeep: '#BE185D',
    glow: 'rgba(244,114,182,0.5)',
    hintText: 'Watch the cue and copy each movement in the right order!',
    voiceIntro: 'Copy the movement patterns! Watch closely — they get trickier each time!',
    voiceComplete: 'You copied every pattern! Amazing motor planning!',
    congrats: 'Pattern Copy Champion!',
  },
  starSequencePath: {
    title: 'Star Sequence Path',
    subtitle: 'Collect the stars in the correct movement order!',
    emoji: '⭐',
    hero: '🌟',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.55)',
    hintText: 'Move in the right order to collect each star and balance!',
    voiceIntro: 'Collect the stars in order! Follow the movement sequence and stay steady!',
    voiceComplete: 'You collected every star in order! Brilliant sequencing!',
    congrats: 'Star Sequence Champion!',
    showTrail: true,
  },
  spaceMission: {
    title: 'Space Mission',
    subtitle: 'Complete the sequence of movement commands in space!',
    emoji: '🚀',
    hero: '🚀',
    accent: '#818CF8',
    accentDeep: '#4338CA',
    glow: 'rgba(129,140,248,0.5)',
    hintText: 'Follow each space command in order — move, turn and balance!',
    voiceIntro: 'Space mission! Complete each movement command in the right order!',
    voiceComplete: 'Mission complete! You followed every command perfectly!',
    congrats: 'Space Mission Champion!',
  },
  pirateJourney: {
    title: 'Pirate Journey',
    subtitle: 'Follow the treasure map using directional sequences!',
    emoji: '🏴',
    hero: '🏴‍☠️',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.5)',
    hintText: 'Follow the treasure map directions in order to find the gold!',
    voiceIntro: 'Ahoy! Follow the treasure map directions in order to find the gold!',
    voiceComplete: 'You found the treasure! A true pirate navigator!',
    congrats: 'Pirate Journey Champion!',
    showTrail: true,
  },
};
