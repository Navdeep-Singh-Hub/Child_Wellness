/**
 * OT Level 9 · Session 1 — Force Awareness themes.
 * Session 1 Game 1: Balloon Press · "Candy Cloud Press"
 */

export const FORCE_SHELL = {
  backText: '#FBCFE8',
  backBorder: 'rgba(251,207,232,0.45)',
  statLabel: '#F9A8D4',
  statValue: '#FDF2F8',
  statBorder: 'rgba(249,168,212,0.45)',
  sparkleColor: '#FDE68A',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  academyLabel: 'PROPRIOCEPTION LAB',
} as const;

export type BalloonPressTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  balloonEmoji: string;
  hintText: string;
  positionCue: string;
  pressCue: string;
  voiceIntro: string;
  voicePress: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const BALLOON_PRESS_THEME: BalloonPressTheme = {
  title: 'Candy Cloud Press',
  subtitle: 'Press the balloon with just-right force — not too soft, not too hard!',
  emoji: '🎈',
  hero: '🫧',
  accent: '#F472B6',
  accentDeep: '#DB2777',
  glow: 'rgba(244,114,182,0.55)',
  bgGradient: ['#1E1B4B', '#5B21B6', '#EC4899', '#FBBF24'],
  decor: ['🎈', '☁️', '🍬', '✨', '🫧', '💗'],
  balloonEmoji: '🎈',
  hintText: 'Push your hands together toward the balloon — gentle then firm!',
  positionCue: 'Step back so the camera sees your arms and chest clearly.',
  pressCue: 'Press the balloon!',
  voiceIntro:
    'Welcome to Candy Cloud Press! Push your hands together and press the balloon with just the right force.',
  voicePress: 'Press now — squeeze and push!',
  voiceComplete: 'Amazing force control! You pressed every balloon perfectly!',
  congrats: 'Force Master!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type RocketPushTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  thrust: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  planets: string[];
  hintText: string;
  positionCue: string;
  pushCue: string;
  voiceIntro: string;
  voicePush: string;
  voiceLaunch: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const ROCKET_PUSH_THEME: RocketPushTheme = {
  title: 'Nebula Rocket Push',
  subtitle: 'Push your palms forward with steady thrust — launch rockets to distant planets!',
  emoji: '🚀',
  hero: '🌌',
  accent: '#38BDF8',
  accentDeep: '#1D4ED8',
  thrust: '#F97316',
  glow: 'rgba(56,189,248,0.55)',
  bgGradient: ['#020617', '#0F172A', '#1E3A8A', '#6D28D9'],
  decor: ['🚀', '🪐', '⭐', '🌠', '☄️', '🛸'],
  planets: ['🪐', '🌍', '🌕', '🔴', '🟠', '🟡', '💫', '🌌'],
  hintText: 'Extend both arms and push your palms toward the rocket — steady thrust!',
  positionCue: 'Step back so the camera sees your chest, arms and hands clearly.',
  pushCue: 'Push to launch!',
  voiceIntro:
    'Welcome to Nebula Rocket Push! Push your palms forward with steady force to launch each rocket into space.',
  voicePush: 'Push now — steady thrust toward the rocket!',
  voiceLaunch: 'Blast off! Amazing thrust control!',
  voiceComplete: 'Mission complete! You launched every rocket with perfect force control!',
  congrats: 'Launch Commander!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export const ROCKET_SHELL = {
  backText: '#BAE6FD',
  backBorder: 'rgba(186,230,253,0.45)',
  statLabel: '#7DD3FC',
  statValue: '#F0F9FF',
  statBorder: 'rgba(125,211,252,0.45)',
  sparkleColor: '#FDE68A',
  good: '#34D399',
  warn: '#FB923C',
  gold: '#FBBF24',
  academyLabel: 'THRUST COMMAND',
} as const;

export type BerrySquishTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  leaf: string;
  juice: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  berries: string[];
  hintText: string;
  positionCue: string;
  squishCue: string;
  voiceIntro: string;
  voiceSquish: string;
  voicePop: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const BERRY_SQUISH_THEME: BerrySquishTheme = {
  title: 'Wild Berry Squish',
  subtitle: 'Bring your hands together and squish each berry with just-right gentle force!',
  emoji: '🍓',
  hero: '🫐',
  accent: '#EF4444',
  accentDeep: '#B91C1C',
  leaf: '#22C55E',
  juice: '#F97316',
  glow: 'rgba(239,68,68,0.5)',
  bgGradient: ['#052E16', '#14532D', '#7F1D1D', '#BE123C'],
  decor: ['🍃', '🌿', '🌸', '🦋', '🌻', '🍂'],
  berries: ['🍓', '🫐', '🍇', '🍒', '🫐', '🍓', '🍇', '🍒'],
  hintText: 'Hold your hands apart, then squeeze them together around the berry — gentle and steady!',
  positionCue: 'Step back so the camera sees both your arms and hands clearly.',
  squishCue: 'Squish the berry!',
  voiceIntro:
    'Welcome to Wild Berry Squish! Bring your hands together and squeeze each berry with just the right gentle force.',
  voiceSquish: 'Squish now — bring your hands together!',
  voicePop: 'Pop! Perfect squish! Juicy and controlled!',
  voiceComplete: 'Berry harvest complete! You squished every berry with amazing force control!',
  congrats: 'Berry Master!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export const BERRY_SHELL = {
  backText: '#BBF7D0',
  backBorder: 'rgba(187,247,208,0.45)',
  statLabel: '#86EFAC',
  statValue: '#F0FDF4',
  statBorder: 'rgba(134,239,172,0.45)',
  sparkleColor: '#FDE68A',
  good: '#34D399',
  warn: '#FB923C',
  gold: '#FBBF24',
  academyLabel: 'BERRY PATCH',
} as const;

export type EnergyMeterTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  neon: string;
  pulse: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  cells: string[];
  hintText: string;
  positionCue: string;
  chargeCue: string;
  easeOffCue: string;
  buildCue: string;
  voiceIntro: string;
  voiceCharge: string;
  voiceSurge: string;
  voiceEaseOff: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const ENERGY_METER_THEME: EnergyMeterTheme = {
  title: 'Voltage Vault',
  subtitle: 'Charge the energy meter to the green zone — not too low, not too high!',
  emoji: '⚡',
  hero: '🔋',
  accent: '#EAB308',
  accentDeep: '#CA8A04',
  neon: '#22D3EE',
  pulse: '#A855F7',
  glow: 'rgba(234,179,8,0.55)',
  bgGradient: ['#030712', '#0F172A', '#1E1B4B', '#713F12'],
  decor: ['⚡', '🔋', '💡', '✨', '🌩️', '⚙️'],
  cells: ['🔋', '⚡', '💠', '🔆', '⚡', '🔋', '💠', '🔆'],
  hintText: 'Hold your hands at chest level and build steady energy — stay in the green zone!',
  positionCue: 'Step back so the camera sees your chest, arms and hands clearly.',
  chargeCue: 'Charge the meter!',
  easeOffCue: 'Ease off — too much energy!',
  buildCue: 'Build more energy!',
  voiceIntro:
    'Welcome to Voltage Vault! Charge the energy meter to the green zone and hold steady — not too soft, not too hard!',
  voiceCharge: 'Charge now — steady energy to the green zone!',
  voiceSurge: 'Power surge! Perfect energy control!',
  voiceEaseOff: 'Ease off a little — stay in the green zone!',
  voiceComplete: 'Vault charged! You hit every energy zone with amazing force control!',
  congrats: 'Energy Master!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export const ENERGY_SHELL = {
  backText: '#FEF08A',
  backBorder: 'rgba(254,240,138,0.45)',
  statLabel: '#FDE047',
  statValue: '#FFFBEB',
  statBorder: 'rgba(253,224,71,0.45)',
  sparkleColor: '#22D3EE',
  good: '#34D399',
  warn: '#FB923C',
  over: '#EF4444',
  gold: '#EAB308',
  academyLabel: 'VOLTAGE VAULT',
} as const;

export type MatchForceTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  mirror: string;
  holo: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  crystals: string[];
  hintText: string;
  positionCue: string;
  matchCue: string;
  higherCue: string;
  lowerCue: string;
  previewCue: string;
  voiceIntro: string;
  voiceMatch: string;
  voiceSync: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const MATCH_FORCE_THEME: MatchForceTheme = {
  title: 'Crystal Force Mirror',
  subtitle: 'Watch the target force, then match it with your body — lock the mirror!',
  emoji: '💎',
  hero: '🪞',
  accent: '#D946EF',
  accentDeep: '#A21CAF',
  mirror: '#22D3EE',
  holo: '#C084FC',
  glow: 'rgba(217,70,239,0.55)',
  bgGradient: ['#0C0A1A', '#1E1B4B', '#581C87', '#0E7490'],
  decor: ['💎', '🪞', '✨', '🔮', '💠', '🌟'],
  crystals: ['💎', '🔮', '💠', '✨', '💎', '🔮', '💠', '✨'],
  hintText: 'Adjust your effort until your force bar matches the crystal target!',
  positionCue: 'Step back so the camera sees your arms, chest and hands clearly.',
  matchCue: 'Match the force!',
  higherCue: 'Use more force!',
  lowerCue: 'Ease off — less force!',
  previewCue: 'Study the target force…',
  voiceIntro:
    'Welcome to Crystal Force Mirror! Watch each target force, then match it with your body to lock the mirror.',
  voiceMatch: 'Match now — line up your force with the crystal!',
  voiceSync: 'Mirror locked! Perfect force match!',
  voiceComplete: 'All mirrors locked! You matched every force with amazing control!',
  congrats: 'Force Matcher!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export const MATCH_SHELL = {
  backText: '#E9D5FF',
  backBorder: 'rgba(233,213,255,0.45)',
  statLabel: '#C084FC',
  statValue: '#FAF5FF',
  statBorder: 'rgba(192,132,252,0.45)',
  sparkleColor: '#22D3EE',
  good: '#34D399',
  warn: '#FB923C',
  target: '#22D3EE',
  gold: '#FBBF24',
  academyLabel: 'FORCE MIRROR',
} as const;
