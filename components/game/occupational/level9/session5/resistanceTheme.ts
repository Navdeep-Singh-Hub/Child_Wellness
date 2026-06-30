/** OT Level 9 · Session 5 — Resistance Control themes */

export const RESISTANCE_SHELL = {
  backText: '#C4B5FD',
  backBorder: 'rgba(196,181,253,0.45)',
  statLabel: '#A78BFA',
  statValue: '#F5F3FF',
  statBorder: 'rgba(167,139,250,0.45)',
  sparkleColor: '#FDE68A',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  academyLabel: 'RESISTANCE CONTROL',
} as const;

export type LaunchPowerTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  ignition: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  orbits: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  stanceCue: string;
  previewCue: string;
  igniteCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceIgnite: string;
  voiceBlast: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const LAUNCH_POWER_THEME: LaunchPowerTheme = {
  title: 'Orbital Resistance Bay',
  subtitle: 'Squat on the launch pad and push upward through ignition resistance — hold steady power in the zone!',
  emoji: '🚀',
  hero: '🛸',
  accent: '#A78BFA',
  accentDeep: '#5B21B6',
  ignition: '#F59E0B',
  glow: 'rgba(167,139,250,0.55)',
  bgGradient: ['#0F0A1E', '#312E81', '#5B21B6', '#FDE68A'],
  decor: ['🚀', '🛸', '⭐', '💫', '🔥', '✨'],
  orbits: ['🛸', '🪐', '⭐', '💫', '🛸', '🪐', '⭐', '🏁'],
  hintText: 'Squat wide on the launch pad, raise your arms and push upward through ignition resistance — steady power!',
  positionCue: 'Step back so the camera sees your full body — legs, arms and torso clearly.',
  formCue: 'Raise your arms and push palms upward at chest height — ignite against the resistance spring!',
  stanceCue: 'Widen your stance and squat lower — strong launch pad resistance pose!',
  previewCue: 'Check the ignition resistance level!',
  igniteCue: 'Ignite launch power!',
  lightCue: 'More power — push harder through the resistance!',
  heavyCue: 'Ease off — hold steady ignition in the zone!',
  voiceIntro:
    'Welcome to Orbital Resistance Bay! Squat on the launch pad and push upward with steady, controlled ignition power!',
  voiceIgnite: 'Ignite now — squat wide and push upward through resistance!',
  voiceBlast: 'Blast off! Perfect resistance control!',
  voiceComplete: 'Bay complete! You launched every rocket with amazing resistance control!',
  congrats: 'Resistance Commander!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type PullTheShipTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  rope: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  ships: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  anchorCue: string;
  previewCue: string;
  pullCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePull: string;
  voiceDock: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const PULL_THE_SHIP_THEME: PullTheShipTheme = {
  title: 'Harbor Tow Dock',
  subtitle: 'Lean back and pull the tow rope at waist height — haul each ship with steady resistance control!',
  emoji: '🚢',
  hero: '⚓',
  accent: '#0EA5E9',
  accentDeep: '#0C4A6E',
  rope: '#38BDF8',
  glow: 'rgba(14,165,233,0.55)',
  bgGradient: ['#0C1929', '#0C4A6E', '#0369A1', '#BAE6FD'],
  decor: ['🚢', '⚓', '🌊', '🪢', '⛵', '✨'],
  ships: ['🚢', '⛵', '🛥️', '🌊', '🚢', '⛵', '🛥️', '🏁'],
  hintText: 'Plant your feet wide, lean back and pull both hands toward your waist — steady tow rope resistance!',
  positionCue: 'Step back so the camera sees your full body — legs, arms and torso clearly.',
  formCue: 'Bend your elbows and pull both hands toward your waist — grip the tow rope and haul!',
  anchorCue: 'Widen your stance and lean back — strong anchor pull pose!',
  previewCue: 'Check the tow rope resistance!',
  pullCue: 'Pull the ship!',
  lightCue: 'Pull harder — the ship needs more tow force!',
  heavyCue: 'Ease off the rope — steady controlled pull!',
  voiceIntro:
    'Welcome to Harbor Tow Dock! Lean back, grip the tow rope and pull with steady, controlled resistance to haul each ship!',
  voicePull: 'Pull now — lean back and haul the tow rope!',
  voiceDock: 'Ship docked! Perfect tow control!',
  voiceComplete: 'Dock complete! You hauled every ship with amazing resistance control!',
  congrats: 'Tow Captain!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type TugChallengeTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  rope: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  rounds: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  stanceCue: string;
  previewCue: string;
  tugCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceTug: string;
  voiceWin: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const TUG_CHALLENGE_THEME: TugChallengeTheme = {
  title: 'Rope Battle Arena',
  subtitle: 'Plant your feet and tug the rope outward at chest height — win each round with steady resistance control!',
  emoji: '🪢',
  hero: '🏆',
  accent: '#EF4444',
  accentDeep: '#991B1B',
  rope: '#FCA5A5',
  glow: 'rgba(239,68,68,0.55)',
  bgGradient: ['#1C1917', '#450A0A', '#991B1B', '#FECACA'],
  decor: ['🪢', '🏆', '💪', '🔥', '⭐', '✨'],
  rounds: ['🪢', '💪', '🏆', '🔥', '🪢', '💪', '🏆', '🏁'],
  hintText: 'Stand wide, extend your arms at chest height and tug the rope outward — steady lateral resistance!',
  positionCue: 'Step back so the camera sees your full body — legs, arms and chest clearly.',
  formCue: 'Extend your arms wide at chest height and tug the rope handles outward — pull with control!',
  stanceCue: 'Widen your stance and bend your knees — strong tug battle anchor pose!',
  previewCue: 'Check the tug resistance level!',
  tugCue: 'Tug the rope!',
  lightCue: 'Tug harder — pull more outward through the resistance!',
  heavyCue: 'Ease off — hold steady tug force in the zone!',
  voiceIntro:
    'Welcome to Rope Battle Arena! Plant your feet wide and tug the rope outward with steady, controlled resistance to win each round!',
  voiceTug: 'Tug now — extend wide and pull outward through resistance!',
  voiceWin: 'You win! Perfect tug control!',
  voiceComplete: 'Arena complete! You won every tug battle with amazing resistance control!',
  congrats: 'Tug Champion!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type VolcanoPushTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  lava: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  vents: string[];
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
  voiceContain: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const VOLCANO_PUSH_THEME: VolcanoPushTheme = {
  title: 'Lava Crater Resistance',
  subtitle: 'Brace wide and push downward on the lava vent — contain each eruption with steady resistance control!',
  emoji: '🌋',
  hero: '🔥',
  accent: '#F97316',
  accentDeep: '#C2410C',
  lava: '#FDBA74',
  glow: 'rgba(249,115,22,0.55)',
  bgGradient: ['#1C1917', '#7C2D12', '#C2410C', '#FED7AA'],
  decor: ['🌋', '🔥', '💨', '🪨', '✨', '☁️'],
  vents: ['🌋', '🔥', '💨', '🪨', '🌋', '🔥', '💨', '🏁'],
  hintText: 'Plant your feet wide, lean forward and push both palms downward on the lava vent — steady eruption resistance!',
  positionCue: 'Step back so the camera sees your full body — legs, arms and torso clearly.',
  formCue: 'Bend your elbows and push both palms downward at mid-chest — press the lava vent with control!',
  stanceCue: 'Widen your stance and brace your legs — strong crater resistance pose!',
  previewCue: 'Check the lava vent pressure!',
  pushCue: 'Push the vent!',
  lightCue: 'Push harder — the vent needs more downward force!',
  heavyCue: 'Ease off — hold steady vent pressure in the zone!',
  voiceIntro:
    'Welcome to Lava Crater Resistance! Brace wide and push downward on each lava vent with steady, controlled eruption resistance!',
  voicePush: 'Push now — brace wide and press downward through resistance!',
  voiceContain: 'Eruption contained! Perfect volcano control!',
  voiceComplete: 'Crater complete! You contained every eruption with amazing resistance control!',
  congrats: 'Volcano Guardian!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type StrengthMasterTheme = {
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
  crowns: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  stanceCue: string;
  previewCue: string;
  holdCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceHold: string;
  voiceCrown: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const STRENGTH_MASTER_THEME: StrengthMasterTheme = {
  title: 'Titan Strength Colosseum',
  subtitle: 'Raise both arms overhead and hold the resistance pillar — prove your strength with steady control!',
  emoji: '💪',
  hero: '🏛️',
  accent: '#EAB308',
  accentDeep: '#A16207',
  pillar: '#FDE047',
  glow: 'rgba(234,179,8,0.55)',
  bgGradient: ['#1C1917', '#422006', '#A16207', '#FEF9C3'],
  decor: ['💪', '🏛️', '🏆', '⭐', '👑', '✨'],
  crowns: ['💪', '🏆', '⭐', '👑', '💪', '🏆', '⭐', '🏁'],
  hintText: 'Plant your feet wide, raise both arms straight overhead and hold the resistance pillar — steady isometric strength!',
  positionCue: 'Step back so the camera sees your full body — legs, arms and torso clearly.',
  formCue: 'Extend your arms straight overhead with palms up — grip the resistance pillar and hold steady!',
  stanceCue: 'Widen your stance and lock your core — strong colosseum power pose!',
  previewCue: 'Check the pillar resistance level!',
  holdCue: 'Hold the pillar!',
  lightCue: 'Press harder — the pillar needs more overhead strength!',
  heavyCue: 'Ease off — hold steady strength in the zone!',
  voiceIntro:
    'Welcome to Titan Strength Colosseum! Raise both arms overhead and hold each resistance pillar with steady, controlled isometric strength!',
  voiceHold: 'Hold now — raise your arms overhead and resist the pillar!',
  voiceCrown: 'Strength crowned! Perfect overhead control!',
  voiceComplete: 'Colosseum complete! You mastered every pillar with amazing resistance control!',
  congrats: 'Strength Master!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};
