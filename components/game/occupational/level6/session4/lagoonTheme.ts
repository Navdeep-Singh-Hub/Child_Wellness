/**
 * OT Level 6 · Session 4 — Per-game visual identity tokens
 * Each static-balance game has a unique lagoon palette, backdrop, and shell.
 */

export type BalanceMode = 'flamingo' | 'island' | 'statue' | 'starHold' | 'freezeHero';

export type BalanceBackdropId = 'coralReef' | 'driftIsles' | 'tideTemple' | 'starPier' | 'waveSentinel';

export type BalanceShell = {
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

export type BalanceGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  collectible: string;
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
  chips: string[];
  startLabel: string;
  backdrop: BalanceBackdropId;
  shell: BalanceShell;
};

export const BALANCE_GAME_THEMES: Record<BalanceMode, BalanceGameTheme> = {
  flamingo: {
    title: 'Coral Flats',
    subtitle: 'Stand on one leg among the coral — collect fish & stars!',
    emoji: '🦩',
    hero: '🦩',
    accent: '#F472B6',
    accentDeep: '#BE185D',
    glow: 'rgba(244,114,182,0.55)',
    collectible: '🐟',
    hintText: 'Lift one foot and balance like a flamingo — hold steady!',
    voiceIntro: 'Stand on one leg like a flamingo! Hold your balance.',
    voiceComplete: 'Amazing balance! What a graceful flamingo!',
    congrats: 'Coral Flats Champion!',
    chips: ['🦩 Balance', '🐟 Collect', '🪸 Coral'],
    startLabel: '🦩 Wade In',
    backdrop: 'coralReef',
    shell: {
      gradient: ['#4A044E', '#831843', '#BE185D', '#F472B6'],
      backText: '#FCE7F3', backBorder: 'rgba(244,114,182,0.35)',
      titleColor: '#FFF1F2', subtitleColor: '#FBCFE8',
      statLabel: '#F9A8D4', statValue: '#F472B6', statBorder: 'rgba(244,114,182,0.35)',
      stageBorder: 'rgba(244,114,182,0.45)', stageBg: 'rgba(74,4,78,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#F9A8D4',
      glassBg: 'rgba(131,24,67,0.35)', glassBorder: 'rgba(244,114,182,0.4)',
      realmLabel: '🪸 CORAL FLATS',
    },
  },
  island: {
    title: 'Driftwood Isles',
    subtitle: 'Hop across tiny islands — don\u2019t fall in the lagoon!',
    emoji: '🏝️',
    hero: '🏝️',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.5)',
    collectible: '🌴',
    hintText: 'Stand on one foot and stay on the island — don\u2019t step off!',
    voiceIntro: 'Balance on one foot on each island. Don\u2019t fall in the water!',
    voiceComplete: 'You crossed every island! Super balance!',
    congrats: 'Driftwood Voyager!',
    chips: ['🏝️ Hop', '🌊 Steady', '🌴 Isles'],
    startLabel: '🏝️ Set Sail',
    backdrop: 'driftIsles',
    shell: {
      gradient: ['#0C4A6E', '#075985', '#0369A1', '#38BDF8'],
      backText: '#E0F2FE', backBorder: 'rgba(56,189,248,0.35)',
      titleColor: '#F0F9FF', subtitleColor: '#BAE6FD',
      statLabel: '#7DD3FC', statValue: '#38BDF8', statBorder: 'rgba(56,189,248,0.35)',
      stageBorder: 'rgba(56,189,248,0.45)', stageBg: 'rgba(12,74,110,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#7DD3FC',
      glassBg: 'rgba(7,89,133,0.35)', glassBorder: 'rgba(56,189,248,0.4)',
      realmLabel: '🏝️ DRIFTWOOD ISLES',
    },
  },
  statue: {
    title: 'Tide Temple',
    subtitle: 'Hold magical poses — stay still as temple stone!',
    emoji: '🗿',
    hero: '🗿',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.5)',
    collectible: '✨',
    hintText: 'Hold the pose and freeze like a statue — ignore distractions!',
    voiceIntro: 'Hold the pose and become a still magical statue!',
    voiceComplete: 'Statue-still! You guarded the temple perfectly!',
    congrats: 'Tide Temple Guardian!',
    chips: ['🗿 Freeze', '✨ Still', '🏛️ Temple'],
    startLabel: '🗿 Enter Temple',
    backdrop: 'tideTemple',
    shell: {
      gradient: ['#1E1B4B', '#312E81', '#4C1D95', '#A78BFA'],
      backText: '#EDE9FE', backBorder: 'rgba(167,139,250,0.35)',
      titleColor: '#F5F3FF', subtitleColor: '#DDD6FE',
      statLabel: '#C4B5FD', statValue: '#A78BFA', statBorder: 'rgba(167,139,250,0.35)',
      stageBorder: 'rgba(167,139,250,0.45)', stageBg: 'rgba(30,27,75,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#C4B5FD',
      glassBg: 'rgba(76,29,149,0.35)', glassBorder: 'rgba(167,139,250,0.4)',
      realmLabel: '🏛️ TIDE TEMPLE',
    },
  },
  starHold: {
    title: 'Star Pier',
    subtitle: 'Reach for the stars on the moonlit pier!',
    emoji: '🌟',
    hero: '🌟',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.5)',
    collectible: '⭐',
    hintText: 'Stretch your arms out to the stars and hold your balance!',
    voiceIntro: 'Reach your arms to the stars and hold steady!',
    voiceComplete: 'You collected all the stars! Strong and steady!',
    congrats: 'Star Pier Champion!',
    chips: ['🌟 Reach', '⭐ Stars', '🌙 Pier'],
    startLabel: '🌟 Step Onto Pier',
    backdrop: 'starPier',
    shell: {
      gradient: ['#422006', '#713F12', '#B45309', '#FBBF24'],
      backText: '#FEF9C3', backBorder: 'rgba(251,191,36,0.35)',
      titleColor: '#FFFBEB', subtitleColor: '#FDE68A',
      statLabel: '#FCD34D', statValue: '#FBBF24', statBorder: 'rgba(251,191,36,0.35)',
      stageBorder: 'rgba(251,191,36,0.45)', stageBg: 'rgba(66,32,6,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE047',
      glassBg: 'rgba(113,63,18,0.35)', glassBorder: 'rgba(251,191,36,0.4)',
      realmLabel: '🌟 STAR PIER',
    },
  },
  freezeHero: {
    title: 'Wave Sentinel',
    subtitle: 'Move with the tide — freeze when the wave hits!',
    emoji: '🦸',
    hero: '🦸',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.5)',
    collectible: '🛡️',
    hintText: 'Move around, then FREEZE and balance the instant you\u2019re signaled!',
    voiceIntro: 'Move like a hero, then freeze and balance when danger comes!',
    voiceComplete: 'Heroic freezes! Your balance saved the day!',
    congrats: 'Wave Sentinel Hero!',
    chips: ['🌊 Move', '🧊 Freeze', '🛡️ Guard'],
    startLabel: '🦸 Take Watch',
    backdrop: 'waveSentinel',
    shell: {
      gradient: ['#064E3B', '#065F46', '#047857', '#34D399'],
      backText: '#D1FAE5', backBorder: 'rgba(52,211,153,0.35)',
      titleColor: '#ECFDF5', subtitleColor: '#A7F3D0',
      statLabel: '#6EE7B7', statValue: '#34D399', statBorder: 'rgba(52,211,153,0.35)',
      stageBorder: 'rgba(52,211,153,0.45)', stageBg: 'rgba(6,78,59,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#6EE7B7',
      glassBg: 'rgba(6,95,70,0.35)', glassBorder: 'rgba(52,211,153,0.4)',
      realmLabel: '🌊 WAVE SENTINEL',
    },
  },
};
