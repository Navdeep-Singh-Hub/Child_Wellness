/** OT Level 9 · Session 9 — Endurance & Effort Regulation themes */

export const ENDURANCE_EFFORT_SHELL = {
  backText: '#A7F3D0',
  backBorder: 'rgba(167,243,208,0.45)',
  statLabel: '#6EE7B7',
  statValue: '#ECFDF5',
  statBorder: 'rgba(52,211,153,0.45)',
  sparkleColor: '#34D399',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  academyLabel: 'ENDURANCE & EFFORT REGULATION',
} as const;

export type EnergyTrailTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  orb: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  waypoints: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  previewCue: string;
  carryCue: string;
  steadyCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceCarry: string;
  voiceCapture: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const ENERGY_TRAIL_THEME: EnergyTrailTheme = {
  title: 'Aurora Energy Trail',
  subtitle: 'Carry each energy orb along the trail with steady controlled effort — hold longer as the path grows!',
  emoji: '⚡',
  hero: '🌠',
  accent: '#22D3EE',
  accentDeep: '#0891B2',
  orb: '#67E8F9',
  glow: 'rgba(34,211,238,0.55)',
  bgGradient: ['#042F2E', '#0E7490', '#06B6D4', '#CFFAFE'],
  decor: ['⚡', '🌠', '✨', '💫', '🔋', '🛤️'],
  waypoints: ['⚡', '💠', '🔷', '💎', '🔮', '⭐', '🌟', '✨'],
  hintText: 'Bend your elbows and carry the energy orb at waist height — hold steady controlled effort in the zone!',
  positionCue: 'Step back so the camera sees your arms, torso and legs clearly.',
  formCue: 'Bend your elbows and hold the energy orb at waist height — steady carry pose!',
  previewCue: 'Energy waypoint ahead!',
  carryCue: 'Carry the energy!',
  steadyCue: 'Hold steady — keep your effort smooth along the trail!',
  lightCue: 'Hold firmer — apply more controlled energy effort!',
  heavyCue: 'Ease off — steady controlled effort in the zone!',
  voiceIntro:
    'Welcome to Aurora Energy Trail! Carry each energy orb along the trail with steady controlled effort — hold longer as the path grows!',
  voiceCarry: 'Carry now — bend your arms and hold the energy orb with steady controlled effort!',
  voiceCapture: 'Energy captured! Perfect endurance control!',
  voiceComplete: 'Trail complete! You carried every energy orb with amazing endurance and control!',
  congrats: 'Energy Trail Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type LongHaulTrainTheme = {
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
  stations: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  leverCue: string;
  previewCue: string;
  chugCue: string;
  steadyCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceChug: string;
  voiceArrive: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const LONG_HAUL_TRAIN_THEME: LongHaulTrainTheme = {
  title: 'Long Haul Railroad',
  subtitle: 'Chug the engine levers with steady steam power — hold longer as the train hauls each station!',
  emoji: '🚂',
  hero: '🛤️',
  accent: '#F97316',
  accentDeep: '#9A3412',
  steam: '#FDBA74',
  glow: 'rgba(249,115,22,0.55)',
  bgGradient: ['#1C1917', '#44403C', '#9A3412', '#FDE68A'],
  decor: ['🚂', '🛤️', '💨', '⚙️', '🔥', '✨'],
  stations: ['🚂', '🚃', '💨', '🚂', '🚃', '💨', '🚂', '🏁'],
  hintText: 'Grip the engine levers at chest height and chug with steady steam power — pump and hold in the zone!',
  positionCue: 'Step back so the camera sees your arms, chest and upper body clearly.',
  formCue: 'Hold both levers at chest height with bent elbows — pump like a train engineer!',
  leverCue: 'Pump the levers with both hands — steady chug-chug steam power!',
  previewCue: 'Station ahead — check steam pressure!',
  chugCue: 'Chug the engine!',
  steadyCue: 'Hold steady — keep your chug smooth along the long haul!',
  lightCue: 'More steam — chug harder with control!',
  heavyCue: 'Ease off the levers — steady chug power in the zone!',
  voiceIntro:
    'Welcome to Long Haul Railroad! Chug the engine levers with steady steam power — hold longer as the train hauls each station!',
  voiceChug: 'Chug now — pump both levers and build steady steam power!',
  voiceArrive: 'Station reached! Perfect long haul endurance!',
  voiceComplete: 'Railroad complete! You hauled every station with amazing endurance and control!',
  congrats: 'Long Haul Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type MountainPushTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  boulder: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  peaks: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  stanceCue: string;
  previewCue: string;
  pushCue: string;
  steadyCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePush: string;
  voiceSummit: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const MOUNTAIN_PUSH_THEME: MountainPushTheme = {
  title: 'Alpine Boulder Ridge',
  subtitle: 'Push each mountain boulder with steady bilateral force — hold longer as you climb the ridge!',
  emoji: '⛰️',
  hero: '🪨',
  accent: '#78716C',
  accentDeep: '#44403C',
  boulder: '#A8A29E',
  glow: 'rgba(120,113,108,0.55)',
  bgGradient: ['#1C1917', '#292524', '#57534E', '#D6D3D1'],
  decor: ['⛰️', '🪨', '🏔️', '💨', '✨', '🌲'],
  peaks: ['🪨', '⛰️', '🏔️', '🪨', '⛰️', '🏔️', '🪨', '🏁'],
  hintText: 'Extend your arms and push both palms into the boulder at chest height — hold steady controlled force in the zone!',
  positionCue: 'Step back so the camera sees your arms, chest and shoulders clearly.',
  formCue: 'Straighten your arms and push both palms forward at chest height — like pushing a mountain boulder!',
  stanceCue: 'Plant your feet and lean into the push — strong mountain stance!',
  previewCue: 'Boulder ahead — check push resistance!',
  pushCue: 'Push the boulder!',
  steadyCue: 'Hold steady — keep your push smooth up the mountain!',
  lightCue: 'Push harder — the boulder needs more controlled force!',
  heavyCue: 'Ease off — steady controlled push in the zone!',
  voiceIntro:
    'Welcome to Alpine Boulder Ridge! Push each mountain boulder with steady bilateral force — hold longer as you climb the ridge!',
  voicePush: 'Push now — extend your arms and press both palms into the boulder with steady force!',
  voiceSummit: 'Summit reached! Perfect mountain push endurance!',
  voiceComplete: 'Ridge complete! You pushed every boulder with amazing endurance and control!',
  congrats: 'Mountain Push Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type EnduranceQuestTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  pillar: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  checkpoints: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  pillarCue: string;
  previewCue: string;
  braceCue: string;
  steadyCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceBrace: string;
  voiceCheckpoint: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const ENDURANCE_QUEST_THEME: EnduranceQuestTheme = {
  title: "Hero's Quest Vault",
  subtitle: 'Brace each quest pillar overhead with steady controlled force — hold longer as the adventure continues!',
  emoji: '⚔️',
  hero: '🛡️',
  accent: '#A855F7',
  accentDeep: '#6D21A8',
  pillar: '#C4B5FD',
  glow: 'rgba(168,85,247,0.55)',
  bgGradient: ['#1E1B4B', '#312E81', '#6D28D9', '#FDE68A'],
  decor: ['⚔️', '🛡️', '🗡️', '✨', '💫', '🏰'],
  checkpoints: ['🗡️', '🛡️', '💎', '🐉', '🌙', '⭐', '👑', '🏁'],
  hintText: 'Raise both arms overhead and brace the quest pillar — hold steady controlled force in the zone!',
  positionCue: 'Step back so the camera sees your arms, shoulders and full upper body clearly.',
  formCue: 'Straighten your arms overhead at shoulder width — strong heroic pillar brace pose!',
  pillarCue: 'Plant your feet and press upward — steady quest vault brace!',
  previewCue: 'Checkpoint ahead — check brace resistance!',
  braceCue: 'Brace the pillar!',
  steadyCue: 'Hold steady — keep your overhead brace smooth through the quest!',
  lightCue: 'Brace firmer — raise your hold with more controlled force!',
  heavyCue: 'Ease off — steady controlled brace in the zone!',
  voiceIntro:
    "Welcome to Hero's Quest Vault! Brace each quest pillar overhead with steady controlled force — hold longer as the adventure continues!",
  voiceBrace: 'Brace now — raise both arms overhead and hold the quest pillar with steady force!',
  voiceCheckpoint: 'Checkpoint secured! Perfect endurance quest control!',
  voiceComplete: 'Quest complete! You braced every checkpoint with amazing endurance and control!',
  congrats: 'Endurance Quest Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type PowerMarathonTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  thunder: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  milestones: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  stanceCue: string;
  previewCue: string;
  powerCue: string;
  steadyCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePower: string;
  voiceMile: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const POWER_MARATHON_THEME: PowerMarathonTheme = {
  title: 'Thunder Power Marathon',
  subtitle: 'Hold each power mile with steady gorilla chest-beat force — endure longer as the marathon continues!',
  emoji: '🏃',
  hero: '💪',
  accent: '#EF4444',
  accentDeep: '#991B1B',
  thunder: '#FCA5A5',
  glow: 'rgba(239,68,68,0.55)',
  bgGradient: ['#1C1917', '#450A0A', '#B91C1C', '#FDE68A'],
  decor: ['🏃', '💪', '⚡', '🦍', '🔥', '✨'],
  milestones: ['🏃', '⛈️', '💪', '🌴', '⚡', '🦍', '🔥', '🏁'],
  hintText: 'Raise your arms wide in gorilla power pose and hold steady chest-beat force in the zone!',
  positionCue: 'Step back so the camera sees your arms, chest, legs and full power stance clearly.',
  formCue: 'Raise both arms wide at chest height with bent elbows — strong gorilla power marathon pose!',
  stanceCue: 'Plant your feet wide and squeeze your power — steady marathon stance!',
  previewCue: 'Mile ahead — check power level!',
  powerCue: 'Hold the power!',
  steadyCue: 'Hold steady — keep your power smooth through the marathon!',
  lightCue: 'More power — squeeze harder with controlled force!',
  heavyCue: 'Ease off — steady controlled power in the zone!',
  voiceIntro:
    'Welcome to Thunder Power Marathon! Hold each power mile with steady gorilla chest-beat force — endure longer as the marathon continues!',
  voicePower: 'Power now — raise your arms wide and hold steady gorilla chest-beat force!',
  voiceMile: 'Mile complete! Perfect power marathon endurance!',
  voiceComplete: 'Marathon complete! You powered through every mile with amazing endurance and control!',
  congrats: 'Power Marathon Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};
