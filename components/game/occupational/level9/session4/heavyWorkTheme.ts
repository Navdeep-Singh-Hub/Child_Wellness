/** OT Level 9 · Session 4 — Heavy Work Missions themes */

export const HEAVY_WORK_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.45)',
  statLabel: '#F59E0B',
  statValue: '#FFFBEB',
  statBorder: 'rgba(245,158,11,0.45)',
  sparkleColor: '#FCD34D',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#EAB308',
  academyLabel: 'HEAVY WORK MISSIONS',
} as const;

export type CarryTreasureTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  chest: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  treasures: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  previewCue: string;
  carryCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceCarry: string;
  voiceDeliver: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const CARRY_TREASURE_THEME: CarryTreasureTheme = {
  title: 'Golden Treasure Cavern',
  subtitle: 'Carry each treasure chest with steady effort — bend your arms and haul with control!',
  emoji: '💰',
  hero: '🏴‍☠️',
  accent: '#F59E0B',
  accentDeep: '#B45309',
  chest: '#D97706',
  glow: 'rgba(245,158,11,0.55)',
  bgGradient: ['#1C1917', '#78350F', '#B45309', '#FDE68A'],
  decor: ['💰', '🏴‍☠️', '✨', '🗝️', '💎', '📦'],
  treasures: ['💰', '📦', '💎', '🗝️', '💰', '📦', '💎', '👑'],
  hintText: 'Bend your arms and hold the chest at your waist — carry with steady, controlled effort!',
  positionCue: 'Step back so the camera sees your arms, chest and upper body clearly.',
  formCue: 'Bend your elbows and hold your hands at waist height — like carrying a heavy chest!',
  previewCue: 'Study the treasure weight!',
  carryCue: 'Carry the treasure!',
  lightCue: 'Haul harder — the chest needs more effort!',
  heavyCue: 'Ease off a little — carry with steady control!',
  voiceIntro:
    'Welcome to Golden Treasure Cavern! Bend your arms and carry each treasure chest with steady, controlled heavy-work effort!',
  voiceCarry: 'Carry now — hold the chest and haul with control!',
  voiceDeliver: 'Treasure delivered! Perfect carry!',
  voiceComplete: 'Cavern complete! You carried every treasure with amazing effort control!',
  congrats: 'Treasure Hauler!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type WallPusherTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  stone: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  walls: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  previewCue: string;
  pushCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePush: string;
  voiceBreach: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const WALL_PUSHER_THEME: WallPusherTheme = {
  title: 'Stone Fortress Corridor',
  subtitle: 'Push each fortress wall with steady bilateral force — extend your arms and press with control!',
  emoji: '🧱',
  hero: '🏰',
  accent: '#64748B',
  accentDeep: '#334155',
  stone: '#94A3B8',
  glow: 'rgba(100,116,139,0.55)',
  bgGradient: ['#0F172A', '#1E293B', '#334155', '#94A3B8'],
  decor: ['🧱', '🏰', '✨', '💪', '⚡', '🪨'],
  walls: ['🧱', '🪨', '🏰', '🧱', '🪨', '🏰', '🧱', '⚡'],
  hintText: 'Extend your arms and push both palms forward into the wall — steady, controlled heavy-work force!',
  positionCue: 'Step back so the camera sees your arms, chest and shoulders clearly.',
  formCue: 'Straighten your arms and push both palms forward at chest height — like pushing a stone wall!',
  previewCue: 'Study the wall resistance!',
  pushCue: 'Push the wall!',
  lightCue: 'Push harder — the wall needs more force!',
  heavyCue: 'Ease off a little — push with steady control!',
  voiceIntro:
    'Welcome to Stone Fortress Corridor! Extend your arms and push each wall with steady, controlled bilateral force!',
  voicePush: 'Push now — both palms forward into the wall!',
  voiceBreach: 'Wall breached! Perfect push!',
  voiceComplete: 'Corridor complete! You pushed through every fortress wall with amazing effort control!',
  congrats: 'Fortress Breaker!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type GorillaPowerTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  jungle: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  beats: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  stanceCue: string;
  previewCue: string;
  powerCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePower: string;
  voiceRoar: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const GORILLA_POWER_THEME: GorillaPowerTheme = {
  title: 'Jungle Power Grove',
  subtitle: 'Beat your chest with gorilla power — wide stance, raised arms and controlled force!',
  emoji: '🦍',
  hero: '🌿',
  accent: '#84CC16',
  accentDeep: '#3F6212',
  jungle: '#A3E635',
  glow: 'rgba(132,204,22,0.55)',
  bgGradient: ['#14532D', '#166534', '#3F6212', '#BEF264'],
  decor: ['🦍', '🌿', '🍃', '💪', '🌴', '✨'],
  beats: ['🦍', '💪', '🌿', '🦍', '💪', '🌿', '🦍', '👑'],
  hintText: 'Stand wide with bent knees, raise your arms and beat your chest with steady gorilla power!',
  positionCue: 'Step back so the camera sees your full body — arms, chest, hips and legs.',
  formCue: 'Raise your arms wide and bend elbows — beat your chest like a powerful gorilla!',
  stanceCue: 'Widen your stance and bend your knees — strong gorilla power pose!',
  previewCue: 'Feel the gorilla power level!',
  powerCue: 'Unleash gorilla power!',
  lightCue: 'More power — beat harder with control!',
  heavyCue: 'Ease off — steady gorilla beats!',
  voiceIntro:
    'Welcome to Jungle Power Grove! Stand wide, raise your arms and beat your chest with steady, controlled gorilla power!',
  voicePower: 'Power now — wide stance and chest beats!',
  voiceRoar: 'Gorilla roar! Perfect power!',
  voiceComplete: 'Grove complete! You unleashed every gorilla power beat with amazing control!',
  congrats: 'Jungle Champion!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type TrainEngineTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  steam: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  cars: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  leverCue: string;
  previewCue: string;
  chugCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceChug: string;
  voiceDepart: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const TRAIN_ENGINE_THEME: TrainEngineTheme = {
  title: 'Steam Railroad Yard',
  subtitle: 'Chug the engine levers with steady steam power — pump both arms and drive the train!',
  emoji: '🚂',
  hero: '🛤️',
  accent: '#F97316',
  accentDeep: '#9A3412',
  steam: '#FDBA74',
  glow: 'rgba(249,115,22,0.55)',
  bgGradient: ['#1E293B', '#334155', '#9A3412', '#FDBA74'],
  decor: ['🚂', '🛤️', '💨', '⚙️', '🔥', '✨'],
  cars: ['🚂', '🚃', '💨', '🚂', '🚃', '💨', '🚂', '🏁'],
  hintText: 'Grip the engine levers at chest height and chug with steady steam power — pump and drive!',
  positionCue: 'Step back so the camera sees your arms, chest and upper body clearly.',
  formCue: 'Hold both levers at chest height with bent elbows — pump like a train engineer!',
  leverCue: 'Pump the levers forward with both hands — chug-chug steam power!',
  previewCue: 'Check the steam pressure gauge!',
  chugCue: 'Chug the engine!',
  lightCue: 'More steam — chug harder with control!',
  heavyCue: 'Ease off the levers — steady chug power!',
  voiceIntro:
    'Welcome to Steam Railroad Yard! Grip the engine levers and chug with steady, controlled steam power to drive the train!',
  voiceChug: 'Chug now — pump both levers and build steam!',
  voiceDepart: 'All aboard! Train departing!',
  voiceComplete: 'Yard complete! You drove every train car with amazing effort control!',
  congrats: 'Engine Master!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type BulldozerMissionTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  dirt: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  piles: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  stanceCue: string;
  previewCue: string;
  pushCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePush: string;
  voiceClear: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const BULLDOZER_MISSION_THEME: BulldozerMissionTheme = {
  title: 'Construction Dirt Yard',
  subtitle: 'Push the bulldozer blade through each dirt pile — wide stance, low arms and steady force!',
  emoji: '🚜',
  hero: '🏗️',
  accent: '#EAB308',
  accentDeep: '#713F12',
  dirt: '#D97706',
  glow: 'rgba(234,179,8,0.55)',
  bgGradient: ['#1C1917', '#44403C', '#713F12', '#FDE68A'],
  decor: ['🚜', '🏗️', '🪨', '💨', '⚙️', '✨'],
  piles: ['🪨', '🏔️', '🪨', '💨', '🪨', '🏔️', '🪨', '🏁'],
  hintText: 'Stand wide with bent knees, push both palms forward at waist height — drive the bulldozer blade!',
  positionCue: 'Step back so the camera sees your full body — arms, hips and legs clearly.',
  formCue: 'Extend your arms and push both palms forward at waist height — like gripping the bulldozer blade!',
  stanceCue: 'Widen your stance and bend your knees — strong bulldozer driver pose!',
  previewCue: 'Check the dirt pile resistance!',
  pushCue: 'Push the blade!',
  lightCue: 'Push harder — the pile needs more bulldozer force!',
  heavyCue: 'Ease off the blade — steady controlled push!',
  voiceIntro:
    'Welcome to Construction Dirt Yard! Stand wide, push the blade low and drive through each dirt pile with steady, controlled force!',
  voicePush: 'Push now — wide stance and drive the blade forward!',
  voiceClear: 'Pile cleared! Perfect bulldozer push!',
  voiceComplete: 'Yard complete! You cleared every dirt pile with amazing effort control!',
  congrats: 'Blade Master!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};
