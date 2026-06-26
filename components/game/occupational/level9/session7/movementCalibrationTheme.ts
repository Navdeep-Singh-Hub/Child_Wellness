/** OT Level 9 · Session 7 — Movement Calibration themes */

export const MOVEMENT_CALIBRATION_SHELL = {
  backText: '#DDD6FE',
  backBorder: 'rgba(221,214,254,0.45)',
  statLabel: '#C4B5FD',
  statValue: '#F5F3FF',
  statBorder: 'rgba(196,181,253,0.45)',
  sparkleColor: '#F9A8D4',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  academyLabel: 'MOVEMENT CALIBRATION',
} as const;

export type SlowMotionTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  trail: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  moves: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  fastCue: string;
  previewCue: string;
  moveCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceMove: string;
  voiceCalibrate: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const SLOW_MOTION_THEME: SlowMotionTheme = {
  title: 'Glacial Motion Lab',
  subtitle: 'Move through each calibration path in ultra-slow motion — hold steady controlled effort in the zone!',
  emoji: '🐢',
  hero: '⏳',
  accent: '#A78BFA',
  accentDeep: '#6D28D9',
  trail: '#C4B5FD',
  glow: 'rgba(167,139,250,0.55)',
  bgGradient: ['#1E1B4B', '#4C1D95', '#7C3AED', '#EDE9FE'],
  decor: ['🐢', '⏳', '✨', '🌊', '💫', '🔮'],
  moves: ['🙋', '🤲', '⬇️', '🙌', '🦵', '🙇', '🪽', '🌟'],
  hintText: 'Move slowly toward the target pose — keep your speed glacial and effort in the zone!',
  positionCue: 'Step back so the camera sees your full body — head, arms, legs and torso clearly.',
  formCue: 'Glide toward the target pose — move slower and match the calibration path!',
  fastCue: 'Too fast! Slow down — glide like glacial motion!',
  previewCue: 'Preview the slow path!',
  moveCue: 'Move in slow motion!',
  lightCue: 'Hold firmer — apply more controlled calibration effort!',
  heavyCue: 'Ease off — steady glacial effort in the zone!',
  voiceIntro:
    'Welcome to Glacial Motion Lab! Move through each calibration path in ultra-slow motion and hold steady, controlled effort!',
  voiceMove: 'Move now — glide slowly toward the target pose!',
  voiceCalibrate: 'Path calibrated! Perfect slow motion control!',
  voiceComplete: 'Lab complete! You calibrated every slow path with amazing awareness and control!',
  congrats: 'Slow Motion Master!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type FastDashTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  streak: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  dashes: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  slowCue: string;
  recklessCue: string;
  previewCue: string;
  dashCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceDash: string;
  voiceLock: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const FAST_DASH_THEME: FastDashTheme = {
  title: 'Turbo Velocity Circuit',
  subtitle: 'Burst to each dash checkpoint fast — lock steady controlled effort in the zone!',
  emoji: '⚡',
  hero: '🏁',
  accent: '#FB923C',
  accentDeep: '#C2410C',
  streak: '#FDE68A',
  glow: 'rgba(251,146,60,0.55)',
  bgGradient: ['#1C1917', '#7C2D12', '#EA580C', '#FFEDD5'],
  decor: ['⚡', '🏁', '💨', '🔥', '✨', '🎯'],
  dashes: ['💪', '🏃', '🙌', '🦵', '⬇️', '⭐', '↔️', '🌟'],
  hintText: 'Dash fast to the checkpoint pose — burst with speed then lock controlled effort in the zone!',
  positionCue: 'Step back so the camera sees your full body — head, arms, legs and torso clearly.',
  formCue: 'Snap to the checkpoint pose — dash faster and match the target!',
  slowCue: 'Too slow! Burst faster — turbo dash to the checkpoint!',
  recklessCue: 'Ease the burst — dash fast but stay controlled!',
  previewCue: 'Preview the dash!',
  dashCue: 'Dash now!',
  lightCue: 'Hold firmer — lock more controlled dash effort!',
  heavyCue: 'Ease off — steady controlled lock in the zone!',
  voiceIntro:
    'Welcome to Turbo Velocity Circuit! Burst to each dash checkpoint with speed, then lock steady, controlled effort!',
  voiceDash: 'Dash now — burst fast to the checkpoint pose!',
  voiceLock: 'Checkpoint locked! Perfect dash control!',
  voiceComplete: 'Circuit complete! You dashed every checkpoint with amazing awareness and control!',
  congrats: 'Fast Dash Champion!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type MatchMySpeedTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  pulse: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  beats: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  slowCue: string;
  fastCue: string;
  previewCue: string;
  matchCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceMatch: string;
  voiceSynced: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const MATCH_MY_SPEED_THEME: MatchMySpeedTheme = {
  title: 'Pace Match Studio',
  subtitle: 'Move at the target speed and match the pose path — hold steady controlled effort in the zone!',
  emoji: '🎯',
  hero: '🎵',
  accent: '#2DD4BF',
  accentDeep: '#0F766E',
  pulse: '#5EEAD4',
  glow: 'rgba(45,212,191,0.55)',
  bgGradient: ['#042F2E', '#0F766E', '#14B8A6', '#CCFBF1'],
  decor: ['🎯', '🎵', '💫', '🔄', '✨', '🌊'],
  beats: ['🚶', '🙋', '🤲', '🦵', '⬇️', '🙌', '🔄', '🌟'],
  hintText: 'Match the target speed and glide to the pose — keep movement pace and effort in the zones!',
  positionCue: 'Step back so the camera sees your full body — head, arms, legs and torso clearly.',
  formCue: 'Match the pose path — adjust your position while keeping the target speed!',
  slowCue: 'Speed up a little — match the target pace on the metronome!',
  fastCue: 'Slow down a little — match the target pace on the metronome!',
  previewCue: 'Preview the pace!',
  matchCue: 'Match my speed!',
  lightCue: 'Hold firmer — apply more controlled match effort!',
  heavyCue: 'Ease off — steady controlled effort in the zone!',
  voiceIntro:
    'Welcome to Pace Match Studio! Move at each target speed, match the pose path, and hold steady, controlled effort!',
  voiceMatch: 'Match now — move at the target speed toward the pose!',
  voiceSynced: 'Speed synced! Perfect pace match control!',
  voiceComplete: 'Studio complete! You matched every speed path with amazing awareness and control!',
  congrats: 'Speed Match Pro!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type SpeedControlTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  lane: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  lanes: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  belowCue: string;
  aboveCue: string;
  previewCue: string;
  controlCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceControl: string;
  voiceSealed: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const SPEED_CONTROL_THEME: SpeedControlTheme = {
  title: 'Speed Governor Arena',
  subtitle: 'Stay inside the speed corridor and match the pose path — hold steady controlled effort in the zone!',
  emoji: '🎚️',
  hero: '🛞',
  accent: '#38BDF8',
  accentDeep: '#0369A1',
  lane: '#7DD3FC',
  glow: 'rgba(56,189,248,0.55)',
  bgGradient: ['#0C1929', '#0C4A6E', '#0284C7', '#E0F2FE'],
  decor: ['🎚️', '🛞', '💠', '🛤️', '✨', '🌊'],
  lanes: ['🌊', '🚶', '🙋', '🦵', '⬇️', '🙌', '🔄', '🌟'],
  hintText: 'Keep your speed inside the corridor band — glide to the pose with steady regulated control!',
  positionCue: 'Step back so the camera sees your full body — head, arms, legs and torso clearly.',
  formCue: 'Match the pose path — adjust position while keeping speed inside the corridor!',
  belowCue: 'Speed up — stay inside the speed corridor band!',
  aboveCue: 'Slow down — stay inside the speed corridor band!',
  previewCue: 'Preview the corridor!',
  controlCue: 'Control your speed!',
  lightCue: 'Hold firmer — apply more controlled governor effort!',
  heavyCue: 'Ease off — steady controlled effort in the zone!',
  voiceIntro:
    'Welcome to Speed Governor Arena! Stay inside each speed corridor, match the pose path, and hold steady, controlled effort!',
  voiceControl: 'Control now — keep your speed inside the corridor band!',
  voiceSealed: 'Corridor sealed! Perfect speed control!',
  voiceComplete: 'Arena complete! You controlled every speed corridor with amazing awareness and control!',
  congrats: 'Speed Control Master!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type RhythmMoveTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  beat: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  grooves: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  missBeatCue: string;
  previewCue: string;
  moveCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceMove: string;
  voiceGroove: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const RHYTHM_MOVE_THEME: RhythmMoveTheme = {
  title: 'Rhythm Movement Stage',
  subtitle: 'Move on each beat and match the pose path — hold steady controlled effort in the zone!',
  emoji: '🥁',
  hero: '🎶',
  accent: '#F472B6',
  accentDeep: '#BE185D',
  beat: '#FBCFE8',
  glow: 'rgba(244,114,182,0.55)',
  bgGradient: ['#500724', '#9D174D', '#DB2777', '#FCE7F3'],
  decor: ['🥁', '🎶', '💃', '✨', '🎵', '🌟'],
  grooves: ['👣', '🙋', '🤲', '🦵', '⬇️', '🙌', '💃', '🌟'],
  hintText: 'Pulse on each beat and glide to the pose — keep rhythm and effort in the zones!',
  positionCue: 'Step back so the camera sees your full body — head, arms, legs and torso clearly.',
  formCue: 'Match the pose path — move on the beat toward the rhythm target!',
  missBeatCue: 'Move on the beat — pulse with the rhythm!',
  previewCue: 'Feel the beat!',
  moveCue: 'Move on the beat!',
  lightCue: 'Hold firmer — apply more controlled rhythm effort!',
  heavyCue: 'Ease off — steady controlled effort in the zone!',
  voiceIntro:
    'Welcome to Rhythm Movement Stage! Move on each beat, match the pose path, and hold steady, controlled effort!',
  voiceMove: 'Move now — pulse on each beat toward the pose!',
  voiceGroove: 'In rhythm! Perfect beat movement control!',
  voiceComplete: 'Stage complete! You grooved every rhythm path with amazing awareness and control!',
  congrats: 'Rhythm Move Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};
