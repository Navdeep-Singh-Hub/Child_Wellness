/**
 * OT Level 6 · Session 10 — "OT Champions (Integrated Core Challenge)"
 * The grand finale. Each game is a themed obstacle course that strings together
 * tasks drawn from every earlier session: posture holds, single-leg balance,
 * reaching & cross-midline, weight shifting, head tracking, animal movement and
 * statue stillness. No new pose math — pure integration of Sessions 1–9.
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
  /** Continuous time the condition must be met to complete the task. */
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

export type ChampionGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  gradient: [string, string, string, string];
  accent: string;
  glow: string;
  treasure: string;
  bannerLabel: string;
  textLight: string;
  textSoft: string;
  /** The scripted sequence of tasks for this course. */
  sequence: TaskType[];
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
};

export const CHAMPION_GAME_THEMES: Record<ChampionMode, ChampionGameTheme> = {
  jungleAdventure: {
    title: 'Jungle Adventure',
    subtitle: 'Explore the jungle and collect hidden treasures!',
    emoji: '🌴',
    hero: '🐵',
    gradient: ['#14532D', '#15803D', '#65A30D', '#FACC15'],
    accent: '#FACC15',
    glow: 'rgba(250,204,21,0.5)',
    treasure: '💎',
    bannerLabel: '🌴 JUNGLE ADVENTURE',
    textLight: '#ECFCCB',
    textSoft: '#BBF7D0',
    sequence: ['standTall', 'reachLeft', 'reachRight', 'balanceOne', 'animalCrouch', 'shiftLeft', 'shiftRight', 'statueStill'],
    hintText: 'Follow each jungle task to find the treasure!',
    voiceIntro: "Welcome to the jungle! Complete each task to collect hidden treasures!",
    voiceComplete: 'You found every jungle treasure! Amazing exploring!',
    congrats: 'Jungle Treasure Champion!',
  },
  pirateMission: {
    title: 'Pirate Mission',
    subtitle: 'Help the pirates recover their lost treasure!',
    emoji: '🏴‍☠️',
    hero: '🏴‍☠️',
    gradient: ['#0C2A4D', '#155E75', '#0D9488', '#F59E0B'],
    accent: '#F59E0B',
    glow: 'rgba(245,158,11,0.5)',
    treasure: '🪙',
    bannerLabel: '🏴‍☠️ PIRATE MISSION',
    textLight: '#E0F2FE',
    textSoft: '#A5F3FC',
    sequence: ['shiftLeft', 'shiftRight', 'reachLeft', 'crossRight', 'balanceOne', 'standTall', 'marchStep', 'statueStill'],
    hintText: 'Complete each pirate challenge to recover the gold!',
    voiceIntro: 'Ahoy! Help the pirates recover their lost treasure, matey!',
    voiceComplete: 'All the gold is recovered! What a brave pirate!',
    congrats: 'Treasure Hunting Captain!',
  },
  spaceExplorer: {
    title: 'Space Explorer',
    subtitle: 'Travel through space collecting energy crystals!',
    emoji: '🚀',
    hero: '🚀',
    gradient: ['#1E1B4B', '#4C1D95', '#6D28D9', '#22D3EE'],
    accent: '#22D3EE',
    glow: 'rgba(34,211,238,0.5)',
    treasure: '🔷',
    bannerLabel: '🚀 SPACE EXPLORER',
    textLight: '#E0E7FF',
    textSoft: '#C7D2FE',
    sequence: ['lookLeft', 'lookRight', 'lookUp', 'lookDown', 'standTall', 'balanceOne', 'reachRight', 'statueStill'],
    hintText: 'Follow the space tasks to gather energy crystals!',
    voiceIntro: 'Blast off! Travel through space and collect the energy crystals!',
    voiceComplete: 'Every crystal collected! Stellar space exploring!',
    congrats: 'Galactic Explorer Champion!',
  },
  mountainRescue: {
    title: 'Mountain Rescue',
    subtitle: 'Rescue the animals trapped on the mountain!',
    emoji: '⛰️',
    hero: '🐻',
    gradient: ['#1E293B', '#334155', '#0EA5E9', '#FDE68A'],
    accent: '#FDE68A',
    glow: 'rgba(253,230,138,0.5)',
    treasure: '🐾',
    bannerLabel: '⛰️ MOUNTAIN RESCUE',
    textLight: '#F1F5F9',
    textSoft: '#BAE6FD',
    sequence: ['reachLeft', 'balanceOne', 'marchStep', 'animalCrouch', 'shiftRight', 'reachRight', 'standTall', 'statueStill'],
    hintText: 'Complete each rescue task to save the animals!',
    voiceIntro: 'Animals are trapped on the mountain! Complete each task to rescue them!',
    voiceComplete: 'Every animal is safe! What a heroic rescue!',
    congrats: 'Mountain Rescue Hero!',
  },
  otObstacleCourse: {
    title: 'OT Obstacle Course',
    subtitle: 'The final challenge — show off every skill you have learned!',
    emoji: '🏆',
    hero: '🏆',
    gradient: ['#312E81', '#7C3AED', '#DB2777', '#F59E0B'],
    accent: '#FBBF24',
    glow: 'rgba(251,191,36,0.6)',
    treasure: '🏅',
    bannerLabel: '🏆 OT CHAMPION COURSE',
    textLight: '#FCE7F3',
    textSoft: '#FBCFE8',
    sequence: [
      'standTall',
      'lookUp',
      'reachLeft',
      'crossRight',
      'shiftLeft',
      'balanceOne',
      'marchStep',
      'animalCrouch',
      'statueStill',
      'standTall',
    ],
    hintText: 'Perform every activity in sequence to become an OT Champion!',
    voiceIntro: 'This is the final challenge! Complete every activity to become an OT Champion!',
    voiceComplete: 'You did it! You are a true OT Champion!',
    congrats: 'OT GRAND CHAMPION! 🏆',
  },
};
