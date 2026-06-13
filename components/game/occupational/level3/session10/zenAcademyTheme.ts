/**
 * Zen Animal Academy — OT Level 3 Session 10 theme tokens.
 */

export const ZEN_MASTERS = {
  owl: { id: 'owl', name: 'Master Owl', emoji: '🦉', color: '#8B5CF6' },
  buddy: { id: 'buddy', name: 'Buddy Dog', emoji: '🐕', color: '#F59E0B' },
  coco: { id: 'coco', name: 'Coco Cat', emoji: '🐱', color: '#F472B6' },
  tree: { id: 'tree', name: 'Tree Spirit', emoji: '🌳', color: '#22C55E' },
  fairy: { id: 'fairy', name: 'Butterfly Fairy', emoji: '🦋', color: '#A855F7' },
  leo: { id: 'leo', name: 'Zen Master Leo', emoji: '🏆', color: '#EAB308' },
} as const;

export const ZEN_GRADIENT: [string, string, string, string] = [
  '#F0FDF4',
  '#DCFCE7',
  '#86EFAC',
  '#15803D',
];

export const ZEN_SHELL = {
  gradient: ZEN_GRADIENT,
  backText: '#14532D',
  backBorder: 'rgba(21,128,61,0.25)',
  titleColor: '#14532D',
  subtitleColor: '#15803D',
  statLabel: '#16A34A',
  statValue: '#14532D',
  statBorder: 'rgba(22,163,74,0.2)',
  playBorder: 'rgba(22,163,74,0.28)',
  playBg: 'rgba(255,255,255,0.42)',
  sparkleColor: '#34D399',
  accent: '#22C55E',
  accentDark: '#15803D',
  confirmBg: '#16A34A',
  coinColor: '#F59E0B',
};

export const LEVEL3_GRADUATION =
  '\n🌟 Level 3 Graduation Festival!\n🏆 Grand Trophy · 🎖️ OT Champion Badge\n➡️ Level 4 Unlocked!';

export const GAME_THEMES = {
  poseMatch: {
    title: 'Posture Match',
    subtitle: 'Match the pose Master Owl shows!',
    emoji: '🎯',
    voiceIntro: 'Watch each posture, copy it calmly, then tap Done!',
    voiceComplete: 'Wonderful focus! Posture master!',
    congrats: 'Posture Match Star!',
    hintText: '🎯 Match the pose!',
  },
  animalPose: {
    title: 'Wild Pose',
    subtitle: 'Copy animal yoga poses with Buddy Dog!',
    emoji: '🐕',
    voiceIntro: 'Copy each animal yoga pose with calm body control!',
    voiceComplete: 'Amazing animal yoga control!',
    congrats: 'Wild Pose Hero!',
    hintText: '🐕 Copy the animal!',
  },
  shapePose: {
    title: 'Shape Body',
    subtitle: 'Make body shapes with Coco Cat!',
    emoji: '⭕',
    voiceIntro: 'Create each body shape shown on screen!',
    voiceComplete: 'Shape body champion!',
    congrats: 'Shape Body Star!',
    hintText: '⭕ Make the shape!',
  },
  freezePose: {
    title: 'Statue Hold',
    subtitle: 'Freeze like a statue until the crystal fills!',
    emoji: '🧊',
    voiceIntro: 'Hold each pose steady until the timer completes!',
    voiceComplete: 'Excellent statue hold!',
    congrats: 'Statue Hold Pro!',
    hintText: '🧊 Hold still!',
  },
  countHold: {
    title: 'Count Still',
    subtitle: 'Stay in pose while counting down!',
    emoji: '🔢',
    voiceIntro: 'Hold the pose while the countdown runs!',
    voiceComplete: 'Count still champion!',
    congrats: 'Count Still Ranger!',
    hintText: '🔢 Stay still!',
  },
} as const;
