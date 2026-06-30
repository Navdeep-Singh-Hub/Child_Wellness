/**
 * OT Level 6 · Session 6 — Per-game visual identity tokens
 * Each dynamic-balance game has a unique forest-trail palette, backdrop, and shell.
 */

export type DynamicMode = 'steppingStones' | 'crossBridge' | 'riverCrossing' | 'adventureTrail' | 'balanceJourney';

export type TrailBackdropId = 'boulderFord' | 'castleSpan' | 'frogLeapRapids' | 'compassPath' | 'summitQuest';

export type TrailShell = {
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

export type DynamicGameTheme = {
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
  chips: string[];
  startLabel: string;
  backdrop: TrailBackdropId;
  shell: TrailShell;
};

export const DYNAMIC_GAME_THEMES: Record<DynamicMode, DynamicGameTheme> = {
  steppingStones: {
    title: 'Boulder Ford',
    subtitle: 'Step stone to stone across the river — don\u2019t fall in!',
    emoji: '🪨',
    hero: '🧒',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.5)',
    hintText: 'Shift onto the glowing stone, then steady your balance!',
    voiceIntro: 'Step from stone to stone and balance after each step!',
    voiceComplete: 'You crossed the whole river! Amazing stepping!',
    congrats: 'Boulder Ford Hero!',
    chips: ['🪨 Step', '💧 Ford', '⚖️ Balance'],
    startLabel: '🪨 Enter Ford',
    backdrop: 'boulderFord',
    shell: {
      gradient: ['#0C4A6E', '#075985', '#0369A1', '#38BDF8'],
      backText: '#E0F2FE', backBorder: 'rgba(56,189,248,0.35)',
      titleColor: '#F0F9FF', subtitleColor: '#BAE6FD',
      statLabel: '#7DD3FC', statValue: '#38BDF8', statBorder: 'rgba(56,189,248,0.35)',
      stageBorder: 'rgba(56,189,248,0.45)', stageBg: 'rgba(12,74,110,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#7DD3FC',
      glassBg: 'rgba(7,89,133,0.35)', glassBorder: 'rgba(56,189,248,0.4)',
      realmLabel: '🪨 BOULDER FORD',
    },
  },
  crossBridge: {
    title: 'Castle Span',
    subtitle: 'Walk heel-to-toe across the narrow bridge to the castle!',
    emoji: '🌉',
    hero: '🏰',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.5)',
    hintText: 'Stay steady and centered, then take each careful step!',
    voiceIntro: 'Walk slowly and steadily across the narrow bridge!',
    voiceComplete: 'You reached the castle! Steady and strong!',
    congrats: 'Castle Span Champion!',
    chips: ['🌉 Bridge', '🏰 Castle', '👣 Steady'],
    startLabel: '🌉 Cross Span',
    backdrop: 'castleSpan',
    shell: {
      gradient: ['#1E1B4B', '#312E81', '#4C1D95', '#A78BFA'],
      backText: '#EDE9FE', backBorder: 'rgba(167,139,250,0.35)',
      titleColor: '#F5F3FF', subtitleColor: '#DDD6FE',
      statLabel: '#C4B5FD', statValue: '#A78BFA', statBorder: 'rgba(167,139,250,0.35)',
      stageBorder: 'rgba(167,139,250,0.45)', stageBg: 'rgba(30,27,75,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#C4B5FD',
      glassBg: 'rgba(76,29,149,0.35)', glassBorder: 'rgba(167,139,250,0.4)',
      realmLabel: '🌉 CASTLE SPAN',
    },
  },
  riverCrossing: {
    title: 'Frog Leap Rapids',
    subtitle: 'Hop between safe islands and land with steady balance!',
    emoji: '🌊',
    hero: '🐸',
    accent: '#22D3EE',
    accentDeep: '#0E7490',
    glow: 'rgba(34,211,238,0.5)',
    hintText: 'Jump to the glowing island and land balanced — then recover!',
    voiceIntro: 'Hop to the safe islands and land with great balance!',
    voiceComplete: 'You hopped across safely! Super landings!',
    congrats: 'Frog Leap Champion!',
    chips: ['🐸 Leap', '🌊 Rapids', '🏝️ Land'],
    startLabel: '🐸 Leap In',
    backdrop: 'frogLeapRapids',
    shell: {
      gradient: ['#164E63', '#155E75', '#0E7490', '#22D3EE'],
      backText: '#CFFAFE', backBorder: 'rgba(34,211,238,0.35)',
      titleColor: '#ECFEFF', subtitleColor: '#A5F3FC',
      statLabel: '#67E8F9', statValue: '#22D3EE', statBorder: 'rgba(34,211,238,0.35)',
      stageBorder: 'rgba(34,211,238,0.45)', stageBg: 'rgba(22,78,99,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#67E8F9',
      glassBg: 'rgba(21,94,117,0.35)', glassBorder: 'rgba(34,211,238,0.4)',
      realmLabel: '🌊 FROG LEAP RAPIDS',
    },
  },
  adventureTrail: {
    title: 'Compass Path',
    subtitle: 'Follow the trail arrows through the forest!',
    emoji: '🚶',
    hero: '🧭',
    accent: '#84CC16',
    accentDeep: '#3F6212',
    glow: 'rgba(132,204,22,0.5)',
    hintText: 'Follow each arrow and movement in order — stay balanced!',
    voiceIntro: 'Follow the trail! Step, turn and stop as the arrows show!',
    voiceComplete: 'You finished the forest trail! Wonderful moving!',
    congrats: 'Compass Path Adventurer!',
    chips: ['🧭 Trail', '🚶 Step', '🌲 Forest'],
    startLabel: '🧭 Begin Path',
    backdrop: 'compassPath',
    shell: {
      gradient: ['#14532D', '#166534', '#3F6212', '#84CC16'],
      backText: '#DCFCE7', backBorder: 'rgba(132,204,22,0.35)',
      titleColor: '#F0FDF4', subtitleColor: '#BBF7D0',
      statLabel: '#A3E635', statValue: '#84CC16', statBorder: 'rgba(132,204,22,0.35)',
      stageBorder: 'rgba(132,204,22,0.45)', stageBg: 'rgba(20,83,45,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#BEF264',
      glassBg: 'rgba(22,101,52,0.35)', glassBorder: 'rgba(132,204,22,0.4)',
      realmLabel: '🧭 COMPASS PATH',
    },
  },
  balanceJourney: {
    title: 'Summit Quest',
    subtitle: 'The grand challenge — step, turn and stop to victory!',
    emoji: '🏆',
    hero: '🏆',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.55)',
    hintText: 'Complete the whole course — stepping, turning and stopping!',
    voiceIntro: 'The grand balance journey begins! Follow every move!',
    voiceComplete: 'You completed the grand balance journey! A true champion!',
    congrats: 'Summit Quest Champion!',
    chips: ['🏆 Quest', '⛰️ Summit', '✨ Grand'],
    startLabel: '🏆 Start Quest',
    backdrop: 'summitQuest',
    shell: {
      gradient: ['#422006', '#713F12', '#B45309', '#FBBF24'],
      backText: '#FEF9C3', backBorder: 'rgba(251,191,36,0.35)',
      titleColor: '#FFFBEB', subtitleColor: '#FDE68A',
      statLabel: '#FCD34D', statValue: '#FBBF24', statBorder: 'rgba(251,191,36,0.35)',
      stageBorder: 'rgba(251,191,36,0.45)', stageBg: 'rgba(66,32,6,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE047',
      glassBg: 'rgba(113,63,18,0.35)', glassBorder: 'rgba(251,191,36,0.4)',
      realmLabel: '🏆 SUMMIT QUEST',
    },
  },
};
