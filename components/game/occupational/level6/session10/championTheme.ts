/**
 * OT Level 6 · Session 10 — Per-game visual identity tokens
 * Grand finale integrated courses — each with a unique palette, backdrop, and shell.
 */

/** Every integrated task the engine knows how to detect. */
export type TaskType =
  | 'standTall'
  | 'balanceOne'
  | 'reachLeft'
  | 'reachRight'
  | 'crossLeft'
  | 'crossRight'
  | 'shiftLeft'
  | 'shiftRight'
  | 'statueStill'
  | 'marchStep'
  | 'animalCrouch'
  | 'lookLeft'
  | 'lookRight'
  | 'lookUp'
  | 'lookDown';

export type TaskInfo = {
  label: string;
  cue: string;
  emoji: string;
  dwellMs: number;
};

export const TASK_INFO: Record<TaskType, TaskInfo> = {
  standTall: { label: 'STAND TALL', cue: 'Stand up nice and tall!', emoji: '🧍', dwellMs: 1200 },
  balanceOne: { label: 'BALANCE!', cue: 'Balance on one foot!', emoji: '🦩', dwellMs: 1300 },
  reachLeft: { label: 'REACH LEFT', cue: 'Reach out to your left!', emoji: '👈', dwellMs: 700 },
  reachRight: { label: 'REACH RIGHT', cue: 'Reach out to your right!', emoji: '👉', dwellMs: 700 },
  crossLeft: { label: 'CROSS LEFT', cue: 'Reach across your body to the left!', emoji: '🤚', dwellMs: 800 },
  crossRight: { label: 'CROSS RIGHT', cue: 'Reach across your body to the right!', emoji: '✋', dwellMs: 800 },
  shiftLeft: { label: 'LEAN LEFT', cue: 'Shift your weight to the left!', emoji: '⬅️', dwellMs: 800 },
  shiftRight: { label: 'LEAN RIGHT', cue: 'Shift your weight to the right!', emoji: '➡️', dwellMs: 800 },
  statueStill: { label: 'FREEZE!', cue: 'Freeze still like a statue!', emoji: '🗿', dwellMs: 1500 },
  marchStep: { label: 'MARCH!', cue: 'March on the spot, knees up!', emoji: '🚶', dwellMs: 2200 },
  animalCrouch: { label: 'CROUCH LOW', cue: 'Crouch down low like a bear!', emoji: '🐻', dwellMs: 1200 },
  lookLeft: { label: 'LOOK LEFT', cue: 'Turn your head to look left!', emoji: '👀', dwellMs: 700 },
  lookRight: { label: 'LOOK RIGHT', cue: 'Turn your head to look right!', emoji: '👀', dwellMs: 700 },
  lookUp: { label: 'LOOK UP', cue: 'Lift your head and look up!', emoji: '⬆️', dwellMs: 700 },
  lookDown: { label: 'LOOK DOWN', cue: 'Lower your head and look down!', emoji: '⬇️', dwellMs: 700 },
};

export type ChampionMode = 'jungleAdventure' | 'pirateMission' | 'spaceExplorer' | 'mountainRescue' | 'otObstacleCourse';

export type ChampionBackdropId = 'emeraldVault' | 'corsairGauntlet' | 'nebulaRun' | 'alpineRescue' | 'championGauntlet';

export type ChampionShell = {
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

export type ChampionGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  treasure: string;
  sequence: TaskType[];
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
  chips: string[];
  startLabel: string;
  backdrop: ChampionBackdropId;
  shell: ChampionShell;
};

export const CHAMPION_GAME_THEMES: Record<ChampionMode, ChampionGameTheme> = {
  jungleAdventure: {
    title: 'Emerald Vault',
    subtitle: 'Explore the jungle and collect hidden treasures!',
    emoji: '🌴',
    hero: '🐵',
    accent: '#FACC15',
    accentDeep: '#CA8A04',
    glow: 'rgba(250,204,21,0.5)',
    treasure: '💎',
    sequence: ['standTall', 'reachLeft', 'reachRight', 'balanceOne', 'animalCrouch', 'shiftLeft', 'shiftRight', 'statueStill'],
    hintText: 'Follow each jungle task to find the treasure!',
    voiceIntro: 'Welcome to the jungle! Complete each task to collect hidden treasures!',
    voiceComplete: 'You found every jungle treasure! Amazing exploring!',
    congrats: 'Emerald Vault Champion!',
    chips: ['🌴 Explore', '💎 Collect', '🐵 Jungle'],
    startLabel: '🌴 Enter Vault',
    backdrop: 'emeraldVault',
    shell: {
      gradient: ['#14532D', '#15803D', '#65A30D', '#FACC15'],
      backText: '#ECFCCB', backBorder: 'rgba(236,252,203,0.35)',
      titleColor: '#FFFFFF', subtitleColor: '#BBF7D0',
      statLabel: '#86EFAC', statValue: '#FEF3C7', statBorder: 'rgba(134,239,172,0.35)',
      stageBorder: 'rgba(132,204,22,0.45)', stageBg: 'rgba(20,83,45,0.55)',
      gold: '#FACC15', good: '#34D399', warn: '#FB7185', sparkleColor: '#BEF264',
      glassBg: 'rgba(22,101,52,0.35)', glassBorder: 'rgba(134,239,172,0.4)',
      realmLabel: '🌴 EMERALD VAULT',
    },
  },
  pirateMission: {
    title: 'Corsair Gauntlet',
    subtitle: 'Help the pirates recover their lost treasure!',
    emoji: '🏴‍☠️',
    hero: '🏴‍☠️',
    accent: '#F59E0B',
    accentDeep: '#92400E',
    glow: 'rgba(245,158,11,0.5)',
    treasure: '🪙',
    sequence: ['shiftLeft', 'shiftRight', 'reachLeft', 'crossRight', 'balanceOne', 'standTall', 'marchStep', 'statueStill'],
    hintText: 'Complete each pirate challenge to recover the gold!',
    voiceIntro: 'Ahoy! Help the pirates recover their lost treasure, matey!',
    voiceComplete: 'All the gold is recovered! What a brave pirate!',
    congrats: 'Corsair Gauntlet Captain!',
    chips: ['🏴‍☠️ Raid', '🪙 Gold', '⚓ Gauntlet'],
    startLabel: '🏴‍☠️ Set Sail',
    backdrop: 'corsairGauntlet',
    shell: {
      gradient: ['#0C2A4D', '#155E75', '#0D9488', '#F59E0B'],
      backText: '#E0F2FE', backBorder: 'rgba(224,242,254,0.35)',
      titleColor: '#FFFFFF', subtitleColor: '#A5F3FC',
      statLabel: '#7DD3FC', statValue: '#FEF3C7', statBorder: 'rgba(125,211,252,0.35)',
      stageBorder: 'rgba(245,158,11,0.45)', stageBg: 'rgba(12,42,77,0.55)',
      gold: '#F59E0B', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE047',
      glassBg: 'rgba(21,94,117,0.35)', glassBorder: 'rgba(245,158,11,0.4)',
      realmLabel: '🏴‍☠️ CORSAIR GAUNTLET',
    },
  },
  spaceExplorer: {
    title: 'Nebula Run',
    subtitle: 'Travel through space collecting energy crystals!',
    emoji: '🚀',
    hero: '🚀',
    accent: '#22D3EE',
    accentDeep: '#0E7490',
    glow: 'rgba(34,211,238,0.5)',
    treasure: '🔷',
    sequence: ['lookLeft', 'lookRight', 'lookUp', 'lookDown', 'standTall', 'balanceOne', 'reachRight', 'statueStill'],
    hintText: 'Follow the space tasks to gather energy crystals!',
    voiceIntro: 'Blast off! Travel through space and collect the energy crystals!',
    voiceComplete: 'Every crystal collected! Stellar space exploring!',
    congrats: 'Nebula Run Champion!',
    chips: ['🚀 Blast', '🔷 Crystals', '🌌 Nebula'],
    startLabel: '🚀 Launch Run',
    backdrop: 'nebulaRun',
    shell: {
      gradient: ['#1E1B4B', '#4C1D95', '#6D28D9', '#22D3EE'],
      backText: '#E0E7FF', backBorder: 'rgba(224,231,255,0.35)',
      titleColor: '#FFFFFF', subtitleColor: '#C7D2FE',
      statLabel: '#A5B4FC', statValue: '#67E8F9', statBorder: 'rgba(165,180,252,0.35)',
      stageBorder: 'rgba(34,211,238,0.45)', stageBg: 'rgba(30,27,75,0.55)',
      gold: '#22D3EE', good: '#34D399', warn: '#FB7185', sparkleColor: '#A5B4FC',
      glassBg: 'rgba(76,29,149,0.35)', glassBorder: 'rgba(34,211,238,0.4)',
      realmLabel: '🚀 NEBULA RUN',
    },
  },
  mountainRescue: {
    title: 'Alpine Rescue',
    subtitle: 'Rescue the animals trapped on the mountain!',
    emoji: '⛰️',
    hero: '🐻',
    accent: '#FDE68A',
    accentDeep: '#CA8A04',
    glow: 'rgba(253,230,138,0.5)',
    treasure: '🐾',
    sequence: ['reachLeft', 'balanceOne', 'marchStep', 'animalCrouch', 'shiftRight', 'reachRight', 'standTall', 'statueStill'],
    hintText: 'Complete each rescue task to save the animals!',
    voiceIntro: 'Animals are trapped on the mountain! Complete each task to rescue them!',
    voiceComplete: 'Every animal is safe! What a heroic rescue!',
    congrats: 'Alpine Rescue Hero!',
    chips: ['⛰️ Climb', '🐾 Rescue', '🐻 Alpine'],
    startLabel: '⛰️ Begin Rescue',
    backdrop: 'alpineRescue',
    shell: {
      gradient: ['#1E293B', '#334155', '#0EA5E9', '#FDE68A'],
      backText: '#F1F5F9', backBorder: 'rgba(241,245,249,0.35)',
      titleColor: '#FFFFFF', subtitleColor: '#BAE6FD',
      statLabel: '#7DD3FC', statValue: '#FEF3C7', statBorder: 'rgba(186,230,253,0.35)',
      stageBorder: 'rgba(14,165,233,0.45)', stageBg: 'rgba(30,41,59,0.55)',
      gold: '#FDE68A', good: '#34D399', warn: '#FB7185', sparkleColor: '#BAE6FD',
      glassBg: 'rgba(51,65,85,0.35)', glassBorder: 'rgba(253,230,138,0.4)',
      realmLabel: '⛰️ ALPINE RESCUE',
    },
  },
  otObstacleCourse: {
    title: 'Champion Gauntlet',
    subtitle: 'The final challenge — show off every skill you have learned!',
    emoji: '🏆',
    hero: '🏆',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.6)',
    treasure: '🏅',
    sequence: [
      'standTall', 'lookUp', 'reachLeft', 'crossRight', 'shiftLeft',
      'balanceOne', 'marchStep', 'animalCrouch', 'statueStill', 'standTall',
    ],
    hintText: 'Perform every activity in sequence to become an OT Champion!',
    voiceIntro: 'This is the final challenge! Complete every activity to become an OT Champion!',
    voiceComplete: 'You did it! You are a true OT Champion!',
    congrats: 'OT GRAND CHAMPION! 🏆',
    chips: ['🏆 Final', '🏅 Medal', '✨ Champion'],
    startLabel: '🏆 Enter Gauntlet',
    backdrop: 'championGauntlet',
    shell: {
      gradient: ['#312E81', '#7C3AED', '#DB2777', '#F59E0B'],
      backText: '#FCE7F3', backBorder: 'rgba(252,231,243,0.35)',
      titleColor: '#FFFFFF', subtitleColor: '#FBCFE8',
      statLabel: '#F9A8D4', statValue: '#FEF3C7', statBorder: 'rgba(251,191,36,0.35)',
      stageBorder: 'rgba(251,191,36,0.45)', stageBg: 'rgba(49,46,129,0.55)',
      gold: '#FBBF24', good: '#34D399', warn: '#FB7185', sparkleColor: '#FDE047',
      glassBg: 'rgba(124,58,237,0.35)', glassBorder: 'rgba(251,191,36,0.4)',
      realmLabel: '🏆 CHAMPION GAUNTLET',
    },
  },
};
