/**
 * OT Level 6 · Session 9 — Per-game visual identity tokens
 * Each postural-endurance game has a unique sky palette, backdrop, and shell.
 */

import type { HoldPose } from '@/components/game/occupational/level6/session1/poseUtils';

export type EnduranceMode = 'superheroHold' | 'airplaneHold' | 'bridgeHold' | 'tallTreeChallenge' | 'longestStatue';

export type SkyBackdropId = 'powerCitadel' | 'skyLane' | 'wildlifeSpan' | 'stormGrove' | 'marblePlaza';

export type SkyShell = {
  gradient: readonly [string, string, string, string];
  backText: string;
  backBorder: string;
  titleColor: string;
  subtitleColor: string;
  statLabel: string;
  statValue: string;
  statBorder: string;
  stageBorder: string;
  stageBg: string;
  gold: string;
  good: string;
  warn: string;
  sparkleColor: string;
  glassBg: string;
  glassBorder: string;
  realmLabel: string;
};

export type EnduranceGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  pose: HoldPose;
  holdLevelsMs: number[];
  distractions: string[];
  holdCueGood: string;
  holdCueBreak: string;
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
  chips: string[];
  startLabel: string;
  backdrop: SkyBackdropId;
  shell: SkyShell;
};

export const ENDURANCE_GAME_THEMES: Record<EnduranceMode, EnduranceGameTheme> = {
  superheroHold: {
    title: 'Power Citadel',
    subtitle: 'Hold your superhero pose and charge your energy!',
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
    congrats: 'Power Citadel Hero!',
    chips: ['🦸 Pose', '⚡ Charge', '💪 Hold'],
    startLabel: '🦸 Enter Citadel',
    backdrop: 'powerCitadel',
    shell: {
      gradient: ['#450A0A', '#7F1D1D', '#B91C1C', '#EF4444'],
      backText: '#FEE2E2', backBorder: 'rgba(239,68,68,0.35)',
      titleColor: '#FFF1F2', subtitleColor: '#FECACA',
      statLabel: '#FCA5A5', statValue: '#FEF3C7', statBorder: 'rgba(239,68,68,0.35)',
      stageBorder: 'rgba(239,68,68,0.45)', stageBg: 'rgba(69,10,10,0.55)',
      gold: '#FCD34D', good: '#34D399', warn: '#FB7185', sparkleColor: '#FCA5A5',
      glassBg: 'rgba(127,29,29,0.35)', glassBorder: 'rgba(239,68,68,0.4)',
      realmLabel: '🦸 POWER CITADEL',
    },
  },
  airplaneHold: {
    title: 'Sky Lane',
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
    congrats: 'Sky Lane Champion!',
    chips: ['✈️ Fly', '☁️ Steady', '🪽 Wings'],
    startLabel: '✈️ Take Off',
    backdrop: 'skyLane',
    shell: {
      gradient: ['#0C4A6E', '#0369A1', '#0EA5E9', '#38BDF8'],
      backText: '#E0F2FE', backBorder: 'rgba(56,189,248,0.35)',
      titleColor: '#F0F9FF', subtitleColor: '#BAE6FD',
      statLabel: '#7DD3FC', statValue: '#FEF3C7', statBorder: 'rgba(125,211,252,0.35)',
      stageBorder: 'rgba(14,165,233,0.45)', stageBg: 'rgba(12,74,110,0.55)',
      gold: '#FCD34D', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE68A',
      glassBg: 'rgba(7,89,133,0.35)', glassBorder: 'rgba(56,189,248,0.4)',
      realmLabel: '✈️ SKY LANE',
    },
  },
  bridgeHold: {
    title: 'Wildlife Span',
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
    congrats: 'Wildlife Span Builder!',
    chips: ['🌉 Bridge', '🦊 Animals', '💪 Strong'],
    startLabel: '🌉 Build Span',
    backdrop: 'wildlifeSpan',
    shell: {
      gradient: ['#064E3B', '#065F46', '#047857', '#34D399'],
      backText: '#D1FAE5', backBorder: 'rgba(52,211,153,0.35)',
      titleColor: '#ECFDF5', subtitleColor: '#A7F3D0',
      statLabel: '#6EE7B7', statValue: '#FEF3C7', statBorder: 'rgba(52,211,153,0.35)',
      stageBorder: 'rgba(52,211,153,0.45)', stageBg: 'rgba(6,78,59,0.55)',
      gold: '#FCD34D', good: '#34D399', warn: '#FB7185', sparkleColor: '#6EE7B7',
      glassBg: 'rgba(6,95,70,0.35)', glassBorder: 'rgba(52,211,153,0.4)',
      realmLabel: '🌉 WILDLIFE SPAN',
    },
  },
  tallTreeChallenge: {
    title: 'Storm Grove',
    subtitle: 'Stand tall as the weather tries to sway you!',
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
    hintText: 'Stand tall and still — don\u2019t let the wind sway you!',
    voiceIntro: 'Become the tallest tree! Stand tall and steady through the weather!',
    voiceComplete: 'You stood tall through every storm! Mighty tree!',
    congrats: 'Storm Grove Champion!',
    chips: ['🌳 Tall', '💨 Weather', '🍃 Steady'],
    startLabel: '🌳 Enter Grove',
    backdrop: 'stormGrove',
    shell: {
      gradient: ['#14532D', '#166534', '#15803D', '#22C55E'],
      backText: '#DCFCE7', backBorder: 'rgba(34,197,94,0.35)',
      titleColor: '#F0FDF4', subtitleColor: '#BBF7D0',
      statLabel: '#4ADE80', statValue: '#FEF3C7', statBorder: 'rgba(74,222,128,0.35)',
      stageBorder: 'rgba(74,222,128,0.45)', stageBg: 'rgba(20,83,45,0.55)',
      gold: '#FCD34D', good: '#34D399', warn: '#FB7185', sparkleColor: '#BEF264',
      glassBg: 'rgba(22,101,52,0.35)', glassBorder: 'rgba(134,239,172,0.4)',
      realmLabel: '🌳 STORM GROVE',
    },
  },
  longestStatue: {
    title: 'Marble Plaza',
    subtitle: 'Stay perfectly still — don\u2019t let anything break your focus!',
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
    congrats: 'Marble Plaza Legend!',
    chips: ['🗿 Freeze', '🧊 Still', '🏛️ Plaza'],
    startLabel: '🗿 Enter Plaza',
    backdrop: 'marblePlaza',
    shell: {
      gradient: ['#1E1B4B', '#312E81', '#4C1D95', '#A78BFA'],
      backText: '#EDE9FE', backBorder: 'rgba(167,139,250,0.35)',
      titleColor: '#F5F3FF', subtitleColor: '#DDD6FE',
      statLabel: '#C4B5FD', statValue: '#FEF3C7', statBorder: 'rgba(167,139,250,0.35)',
      stageBorder: 'rgba(167,139,250,0.45)', stageBg: 'rgba(30,27,75,0.55)',
      gold: '#FCD34D', good: '#34D399', warn: '#FB7185', sparkleColor: '#C4B5FD',
      glassBg: 'rgba(76,29,149,0.35)', glassBorder: 'rgba(167,139,250,0.4)',
      realmLabel: '🗿 MARBLE PLAZA',
    },
  },
};
