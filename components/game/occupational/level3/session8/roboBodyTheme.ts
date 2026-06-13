/**
 * Robo Body Builder Academy — OT Level 3 Session 8 theme tokens.
 */

export const ROBO_CHARACTERS = {
  professor: { id: 'professor', name: 'Professor Bot', emoji: '🤖', color: '#3B82F6' },
  roboKid: { id: 'roboKid', name: 'Robo Kid', emoji: '🦾', color: '#22C55E' },
  captain: { id: 'captain', name: 'Captain Circuit', emoji: '🚀', color: '#F59E0B' },
  sparky: { id: 'sparky', name: 'Sparky Assistant', emoji: '⚡', color: '#EAB308' },
  master: { id: 'master', name: 'Body Master Robot', emoji: '🎯', color: '#8B5CF6' },
} as const;

export const ROBO_GRADIENT: [string, string, string, string] = [
  '#EFF6FF',
  '#DBEAFE',
  '#93C5FD',
  '#2563EB',
];

export const ROBO_SHELL = {
  gradient: ROBO_GRADIENT,
  backText: '#1E3A8A',
  backBorder: 'rgba(37,99,235,0.25)',
  titleColor: '#1E3A8A',
  subtitleColor: '#2563EB',
  statLabel: '#3B82F6',
  statValue: '#1E3A8A',
  statBorder: 'rgba(59,130,246,0.2)',
  playBorder: 'rgba(59,130,246,0.28)',
  playBg: 'rgba(255,255,255,0.42)',
  sparkleColor: '#60A5FA',
  accent: '#3B82F6',
  accentDark: '#1D4ED8',
  coinColor: '#F59E0B',
};

export const GAME_THEMES = {
  touchHead: {
    title: 'Head Tap',
    subtitle: 'Touch the glowing body part on Robo Kid!',
    emoji: '👤',
    voiceIntro: 'Touch the body part when Professor Bot says its name!',
    voiceComplete: 'Excellent body detective work!',
    congrats: 'Head Tap Star!',
    hintText: '👤 Touch the glow!',
  },
  shouldersTap: {
    title: 'Shoulder Pick',
    subtitle: 'Find left and right body parts!',
    emoji: '💪',
    voiceIntro: 'Touch the LEFT or RIGHT body part Professor Bot calls out!',
    voiceComplete: 'Amazing laterality skills!',
    congrats: 'Shoulder Pick Pro!',
    hintText: '⬅️ ➡️ Left or Right!',
  },
  bodyPuzzle: {
    title: 'Body Build',
    subtitle: 'Drag robot parts into the correct spots!',
    emoji: '🧩',
    voiceIntro: 'Build the robot by placing each body part in the right place!',
    voiceComplete: 'Robot builder master!',
    congrats: 'Body Build Champion!',
    hintText: '🧩 Drag to build!',
  },
  followBody: {
    title: 'Copy Body',
    subtitle: 'Watch Professor Bot, then copy the body part!',
    emoji: '👥',
    voiceIntro: 'Watch which part Professor Bot touches, then copy it!',
    voiceComplete: 'Great body copying!',
    congrats: 'Copy Body Hero!',
    hintText: '👀 Watch and copy!',
  },
  bodyFlash: {
    title: 'Quick Part',
    subtitle: 'Tap flashing body parts before they disappear!',
    emoji: '⚡',
    voiceIntro: 'Tap each flashing body part as fast as you can!',
    voiceComplete: 'Quick part champion!',
    congrats: 'Quick Part Ranger!',
    hintText: '⚡ Tap fast!',
  },
} as const;
