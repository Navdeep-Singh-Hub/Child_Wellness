/**
 * OT Level 6 · Session 9 — "Sky Champions (Postural Endurance)"
 * Visual tokens. A bright daytime-sky gradient (deep ocean-blue → sky blue →
 * cyan → warm sunrise gold) evoking effort, altitude and triumph — distinct
 * from the navy night-space of Session 3 and the teal lagoon of Session 4.
 */

import type { HoldPose } from '@/components/game/occupational/level6/session1/poseUtils';

export type EnduranceMode = 'superheroHold' | 'airplaneHold' | 'bridgeHold' | 'tallTreeChallenge' | 'longestStatue';

export const SKY_SHELL = {
  gradient: ['#0C4A6E', '#0369A1', '#0EA5E9', '#FDE68A'] as [string, string, string, string],
  backText: '#E0F2FE',
  backBorder: 'rgba(224,242,254,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#BAE6FD',
  statLabel: '#7DD3FC',
  statValue: '#FEF3C7',
  statBorder: 'rgba(125,211,252,0.35)',
  stageBorder: 'rgba(14,165,233,0.45)',
  stageBg: 'rgba(12,74,110,0.5)',
  gold: '#FCD34D',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#FDE68A',
} as const;

export type EnduranceGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  /** Which pose-quality function the engine scores. */
  pose: HoldPose;
  /** Hold targets per level (ms), increasing. */
  holdLevelsMs: number[];
  /** Floating distraction emojis (test motor inhibition / focus). */
  distractions: string[];
  holdCueGood: string;
  holdCueBreak: string;
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
};

export const ENDURANCE_GAME_THEMES: Record<EnduranceMode, EnduranceGameTheme> = {
  superheroHold: {
    title: 'Superhero Hold',
    subtitle: 'Hold your powerful superhero pose and charge your energy!',
    emoji: '🦸',
    hero: '🦸',
    accent: '#EF4444',
    accentDeep: '#991B1B',
    glow: 'rgba(239,68,68,0.55)',
    pose: 'superhero',
    holdLevelsMs: [4000, 6000, 8000, 10000, 12000],
    distractions: ['💥', '⚡', '✨', '🌟'],
    holdCueGood: 'Charging power! Hold strong! ⚡',
    holdCueBreak: 'Stand tall and strike your superhero pose!',
    hintText: 'Stand tall and proud — hold your power pose!',
    voiceIntro: 'Strike your superhero pose and hold it to charge your power!',
    voiceComplete: 'Maximum power charged! You are a true superhero!',
    congrats: 'Super Endurance Hero!',
  },
  airplaneHold: {
    title: 'Airplane Hold',
    subtitle: 'Stretch your arms wide and fly steady like an airplane!',
    emoji: '✈️',
    hero: '✈️',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.5)',
    pose: 'airplane',
    holdLevelsMs: [4000, 6000, 8000, 10000, 12000],
    distractions: ['☁️', '🐦', '🎈', '🌥️'],
    holdCueGood: 'Flying steady! Keep those wings out! ✈️',
    holdCueBreak: 'Stretch both arms out wide like airplane wings!',
    hintText: 'Arms out wide and level — fly steady!',
    voiceIntro: 'Stretch your arms out wide like wings and fly steady!',
    voiceComplete: 'Smooth flight! Your wings held strong the whole way!',
    congrats: 'High-Flying Champion!',
  },
  bridgeHold: {
    title: 'Bridge Hold',
    subtitle: 'Hold your bridge so the animals can cross safely!',
    emoji: '🌉',
    hero: '🦊',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.5)',
    pose: 'bridge',
    holdLevelsMs: [4000, 6000, 7000, 9000, 11000],
    distractions: ['🦊', '🐰', '🦔', '🐿️'],
    holdCueGood: 'Strong bridge! The animals are crossing! 🦊',
    holdCueBreak: 'Lift into your strong bridge position!',
    hintText: 'Keep your bridge strong and steady!',
    voiceIntro: 'Build a strong bridge and hold it so the animals can cross!',
    voiceComplete: 'Every animal crossed safely! What a strong bridge!',
    congrats: 'Strong Bridge Builder!',
  },
  tallTreeChallenge: {
    title: 'Tall Tree Challenge',
    subtitle: 'Stand tall and steady as the weather tries to sway you!',
    emoji: '🌳',
    hero: '🌳',
    accent: '#22C55E',
    accentDeep: '#15803D',
    glow: 'rgba(34,197,94,0.5)',
    pose: 'tree',
    holdLevelsMs: [5000, 7000, 9000, 11000, 13000],
    distractions: ['🍃', '🌧️', '💨', '🦋'],
    holdCueGood: 'Standing tall and strong! 🌳',
    holdCueBreak: 'Stand up tall like the tallest tree!',
    hintText: 'Stand tall and still — don’t let the wind sway you!',
    voiceIntro: 'Become the tallest tree! Stand tall and steady through the weather!',
    voiceComplete: 'You stood tall through every storm! Mighty tree!',
    congrats: 'Tallest Tree Champion!',
  },
  longestStatue: {
    title: 'Longest Statue',
    subtitle: 'Stay perfectly still — don’t let anything break your focus!',
    emoji: '🗿',
    hero: '🗿',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.5)',
    pose: 'statue',
    holdLevelsMs: [5000, 8000, 10000, 13000, 16000],
    distractions: ['📸', '👀', '🎉', '🤡', '🎈'],
    holdCueGood: 'Perfectly still! Amazing focus! 🗿',
    holdCueBreak: 'Freeze! Become a still, silent statue!',
    hintText: 'Stay frozen like a statue — no moving!',
    voiceIntro: 'Become a famous statue! Stay perfectly still no matter what!',
    voiceComplete: 'Incredible stillness! You held the longest statue record!',
    congrats: 'Legendary Still Statue!',
  },
};
