/** OT Level 9 · Session 8 — Proprioceptive Sequencing themes */

export const PROPRIO_SEQUENCING_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.45)',
  statLabel: '#FCD34D',
  statValue: '#FFFBEB',
  statBorder: 'rgba(252,211,77,0.45)',
  sparkleColor: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  academyLabel: 'PROPRIOCEPTIVE SEQUENCING',
} as const;

export type PushThenCarryTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  push: string;
  carry: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  cargos: string[];
  hintText: string;
  positionCue: string;
  pushFormCue: string;
  carryFormCue: string;
  planCue: string;
  pushCue: string;
  carryCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePlan: string;
  voicePush: string;
  voiceCarry: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const PUSH_THEN_CARRY_THEME: PushThenCarryTheme = {
  title: 'Cargo Push Dock',
  subtitle: 'Push each crate with steady force, then carry it with controlled effort — complete the haul sequence!',
  emoji: '📦',
  hero: '🚚',
  accent: '#F59E0B',
  accentDeep: '#B45309',
  push: '#FDE68A',
  carry: '#FBBF24',
  glow: 'rgba(245,158,11,0.55)',
  bgGradient: ['#451A03', '#92400E', '#D97706', '#FEF3C7'],
  decor: ['📦', '🚚', '🏗️', '⚙️', '✨', '🛞'],
  cargos: ['📦', '🪨', '🪵', '🛢️', '🧱', '💎', '⚓', '🌟'],
  hintText: 'Push the crate with extended arms and steady force — then bend and carry with controlled effort!',
  positionCue: 'Step back so the camera sees your full body — arms, torso and legs clearly.',
  pushFormCue: 'Extend your arms forward at chest height — push the crate with steady bilateral force!',
  carryFormCue: 'Bend your elbows and hold the crate at waist height — carry with steady controlled effort!',
  planCue: 'Plan the sequence!',
  pushCue: 'Push the crate!',
  carryCue: 'Carry the crate!',
  lightCue: 'Hold firmer — apply more controlled sequence effort!',
  heavyCue: 'Ease off — steady controlled effort in the zone!',
  voiceIntro:
    'Welcome to Cargo Push Dock! Push each crate with steady force, then carry it with controlled effort — complete every haul sequence!',
  voicePlan: 'Remember the plan — push first, then carry!',
  voicePush: 'Push now — extend your arms and thrust with steady controlled force!',
  voiceCarry: 'Carry now — bend your arms and haul with steady controlled effort!',
  voiceComplete: 'Dock complete! You finished every push-then-carry sequence with amazing awareness and control!',
  congrats: 'Cargo Sequence Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type PowerSequenceTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  charge: string;
  blast: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  cores: string[];
  hintText: string;
  positionCue: string;
  chargeFormCue: string;
  blastFormCue: string;
  planCue: string;
  chargeCue: string;
  blastCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePlan: string;
  voiceCharge: string;
  voiceBlast: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const POWER_SEQUENCE_THEME: PowerSequenceTheme = {
  title: 'Thunder Charge Vault',
  subtitle: 'Charge power in the stance zone, then blast with controlled thrust — complete every power sequence!',
  emoji: '⚡',
  hero: '🔋',
  accent: '#F97316',
  accentDeep: '#C2410C',
  charge: '#FDE68A',
  blast: '#FB923C',
  glow: 'rgba(249,115,22,0.55)',
  bgGradient: ['#431407', '#9A3412', '#EA580C', '#FFEDD5'],
  decor: ['⚡', '🔋', '💥', '✨', '🔥', '🌟'],
  cores: ['🔋', '⚡', '💥', '🔥', '⭐', '🚀', '💫', '🌟'],
  hintText: 'Charge power in the stance zone with steady effort — then blast with controlled upward thrust!',
  positionCue: 'Step back so the camera sees your full body — arms, torso and legs clearly.',
  chargeFormCue: 'Raise your arms wide in the power stance — charge with steady controlled effort in the zone!',
  blastFormCue: 'Squat low and thrust upward — blast with steady controlled power in the zone!',
  planCue: 'Plan the power sequence!',
  chargeCue: 'Charge power!',
  blastCue: 'Blast now!',
  lightCue: 'Hold firmer — apply more controlled power effort!',
  heavyCue: 'Ease off — steady controlled effort in the zone!',
  voiceIntro:
    'Welcome to Thunder Charge Vault! Charge power in the stance zone, then blast with controlled thrust — complete every power sequence!',
  voicePlan: 'Remember the plan — charge first, then blast!',
  voiceCharge: 'Charge now — build power in the stance zone with steady controlled effort!',
  voiceBlast: 'Blast now — thrust upward with steady controlled power!',
  voiceComplete: 'Vault complete! You finished every power sequence with amazing awareness and control!',
  congrats: 'Power Sequence Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type ReachThenPressTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  reach: string;
  press: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  targets: string[];
  hintText: string;
  positionCue: string;
  reachFormCue: string;
  pressFormCue: string;
  planCue: string;
  reachCue: string;
  pressCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePlan: string;
  voiceReach: string;
  voicePress: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const REACH_THEN_PRESS_THEME: ReachThenPressTheme = {
  title: 'Reach Force Observatory',
  subtitle: 'Reach each target pose, then press with steady force — complete every reach-press sequence!',
  emoji: '🎯',
  hero: '🛰️',
  accent: '#38BDF8',
  accentDeep: '#1D4ED8',
  reach: '#93C5FD',
  press: '#818CF8',
  glow: 'rgba(56,189,248,0.55)',
  bgGradient: ['#0C1929', '#1E3A5F', '#2563EB', '#DBEAFE'],
  decor: ['🎯', '🛰️', '✨', '🔭', '💫', '🌟'],
  targets: ['🙌', '👋', '🤚', '🙋', '⭐', '🦸', '🔦', '🌟'],
  hintText: 'Reach the target pose with your whole body — then press forward with steady controlled force!',
  positionCue: 'Step back so the camera sees your full body — arms, torso and legs clearly.',
  reachFormCue: 'Match the reach pose — extend and position your arms and body toward the target!',
  pressFormCue: 'Extend your arms forward at chest height — press with steady bilateral force!',
  planCue: 'Plan the sequence!',
  reachCue: 'Reach the target!',
  pressCue: 'Press now!',
  lightCue: 'Hold firmer — apply more controlled press effort!',
  heavyCue: 'Ease off — steady controlled effort in the zone!',
  voiceIntro:
    'Welcome to Reach Force Observatory! Reach each target pose, then press with steady force — complete every reach-press sequence!',
  voicePlan: 'Remember the plan — reach first, then press!',
  voiceReach: 'Reach now — match the target pose with your whole body!',
  voicePress: 'Press now — extend your arms and thrust with steady controlled force!',
  voiceComplete: 'Observatory complete! You finished every reach-press sequence with amazing awareness and control!',
  congrats: 'Reach-Press Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type PirateWorkMissionTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  haul: string;
  stow: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  loot: string[];
  hintText: string;
  positionCue: string;
  haulFormCue: string;
  stowFormCue: string;
  anchorCue: string;
  planCue: string;
  haulCue: string;
  stowCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePlan: string;
  voiceHaul: string;
  voiceStow: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const PIRATE_WORK_MISSION_THEME: PirateWorkMissionTheme = {
  title: 'Pirate Harbor Deck',
  subtitle: 'Haul the tow rope with steady pull force, then stow the treasure with controlled carry effort — complete every pirate work mission!',
  emoji: '🏴‍☠️',
  hero: '⚓',
  accent: '#14B8A6',
  accentDeep: '#0F766E',
  haul: '#5EEAD4',
  stow: '#FBBF24',
  glow: 'rgba(20,184,166,0.55)',
  bgGradient: ['#042F2E', '#115E59', '#0D9488', '#CCFBF1'],
  decor: ['🏴‍☠️', '⚓', '🦜', '🌊', '💰', '🗺️'],
  loot: ['💰', '📦', '💎', '🪙', '👑', '⚓', '🏆', '🌟'],
  hintText: 'Haul the tow rope with steady pull force — then bend and stow the treasure with controlled carry effort!',
  positionCue: 'Step back so the camera sees your full body — arms, torso and legs clearly.',
  haulFormCue: 'Plant your feet wide, lean back and pull both hands toward your waist — haul the tow rope!',
  stowFormCue: 'Bend your elbows and hold the treasure at waist height — stow with steady controlled effort!',
  anchorCue: 'Widen your stance and lean back — strong anchor haul pose!',
  planCue: 'Plan the pirate mission!',
  haulCue: 'Haul the rope!',
  stowCue: 'Stow the treasure!',
  lightCue: 'Hold firmer — apply more controlled pirate work effort!',
  heavyCue: 'Ease off — steady controlled effort in the zone!',
  voiceIntro:
    'Welcome to Pirate Harbor Deck! Haul the tow rope with steady pull force, then stow the treasure with controlled carry effort — complete every pirate work mission!',
  voicePlan: 'Remember the plan — haul first, then stow!',
  voiceHaul: 'Haul now — lean back and pull the tow rope with steady controlled force!',
  voiceStow: 'Stow now — bend your arms and carry the treasure with steady controlled effort!',
  voiceComplete: 'Deck complete! You finished every pirate work mission with amazing awareness and control!',
  congrats: 'Pirate Work Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type RainbowChallengeTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  arch: string;
  glow: string;
  glowAura: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  colors: string[];
  hintText: string;
  positionCue: string;
  archFormCue: string;
  glowFormCue: string;
  shineCue: string;
  planCue: string;
  archCue: string;
  glowCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePlan: string;
  voiceArch: string;
  voiceGlow: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const RAINBOW_CHALLENGE_THEME: RainbowChallengeTheme = {
  title: 'Rainbow Spectrum Bridge',
  subtitle: 'Shape each rainbow arch with your whole body, then glow with steady overhead hold effort — complete every rainbow challenge!',
  emoji: '🌈',
  hero: '✨',
  accent: '#A855F7',
  accentDeep: '#7C3AED',
  arch: '#F472B6',
  glow: '#FBBF24',
  glowAura: 'rgba(168,85,247,0.55)',
  bgGradient: ['#1E1B4B', '#4C1D95', '#7C3AED', '#FDE68A'],
  decor: ['🌈', '✨', '🎨', '💫', '🌟', '🦋'],
  colors: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '💜', '✨'],
  hintText: 'Shape the rainbow arch with your arms and body — then raise overhead and glow with steady controlled hold effort!',
  positionCue: 'Step back so the camera sees your full body — arms, torso and legs clearly.',
  archFormCue: 'Match the rainbow arch — spread your arms wide overhead in a curved arc!',
  glowFormCue: 'Raise both arms straight overhead and hold the rainbow glow with steady controlled effort!',
  shineCue: 'Hold your arch steady — shape the rainbow curve with both arms!',
  planCue: 'Plan the rainbow challenge!',
  archCue: 'Shape the arch!',
  glowCue: 'Glow now!',
  lightCue: 'Hold firmer — apply more controlled glow effort!',
  heavyCue: 'Ease off — steady controlled effort in the zone!',
  voiceIntro:
    'Welcome to Rainbow Spectrum Bridge! Shape each rainbow arch with your whole body, then glow with steady overhead hold effort — complete every rainbow challenge!',
  voicePlan: 'Remember the plan — arch first, then glow!',
  voiceArch: 'Arch now — spread your arms wide overhead and shape the rainbow curve!',
  voiceGlow: 'Glow now — raise your arms overhead and hold with steady controlled effort!',
  voiceComplete: 'Bridge complete! You finished every rainbow challenge with amazing awareness and control!',
  congrats: 'Rainbow Challenge Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};
