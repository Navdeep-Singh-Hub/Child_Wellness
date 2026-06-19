/**
 * OT Level 8 · Session 5 — "Body Position Planning" (Position Quest)
 *
 * Five camera-tracked games where the child plans and moves their whole body
 * into a target position and holds it: reach high, reach low, reach to a side,
 * turn the body, or make a body shape. Pose tracking scores accuracy, posture
 * and movement quality.
 */
import type { PositionSpec } from '@/components/game/occupational/level8/session5/bodyPosition';

export type BodyPositionMode = 'highReach' | 'lowReach' | 'sideReach' | 'turnPosition' | 'shapeBody';

export const BODYPOS_SHELL = {
  backText: '#BFDBFE',
  backBorder: 'rgba(191,219,254,0.4)',
  statLabel: '#93C5FD',
  statValue: '#DBEAFE',
  statBorder: 'rgba(147,197,253,0.4)',
  sparkleColor: '#FEF08A',
} as const;

export type BodyPositionGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  glow: string;
  bgGradient: [string, string, string, string];
  rounds: number;
  positions: PositionSpec[];
  collectible: string;
  hintText: string;
  positionCue: string;
  voiceIntro: string;
  voicePlan: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

const SKILL = ['praxis', 'motor-planning', 'body-awareness', 'posture', 'coordination'];

export const BODYPOS_GAME_THEMES: Record<BodyPositionMode, BodyPositionGameTheme> = {
  highReach: {
    title: 'High Reach',
    subtitle: 'Stretch up high to reach the sky targets!',
    emoji: '🙌',
    hero: '🌟',
    accent: '#38BDF8',
    glow: 'rgba(56,189,248,0.55)',
    bgGradient: ['#0C4A6E', '#0369A1', '#0EA5E9', '#7DD3FC'],
    rounds: 6,
    positions: [
      { id: 'h-two', kind: 'reachHigh', name: 'Sky Reach', icon: '🌟', hands: 2 },
      { id: 'h-one', kind: 'reachHigh', name: 'One-Arm Reach', icon: '✋', hands: 1 },
      { id: 'h-star', kind: 'reachHigh', name: 'Grab the Star', icon: '⭐', hands: 2 },
      { id: 'h-tall', kind: 'shape', name: 'Tall Tower', icon: '🗼', shape: 'tall' },
    ],
    collectible: '⭐',
    hintText: 'Reach your hands up high and hold it!',
    positionCue: 'Stand back so the camera sees your arms — then reach up!',
    voiceIntro: 'Up we go! Stretch your hands up high to reach each sky target!',
    voicePlan: 'Get ready to reach up high…',
    voiceComplete: 'Sky high! You reached every star!',
    congrats: 'High Reach Hero!',
    skillTags: SKILL,
  },
  lowReach: {
    title: 'Low Reach',
    subtitle: 'Bend down low to reach the ground treasures!',
    emoji: '🌱',
    hero: '🌱',
    accent: '#84CC16',
    glow: 'rgba(132,204,22,0.55)',
    bgGradient: ['#1A2E05', '#3F6212', '#65A30D', '#BEF264'],
    rounds: 6,
    positions: [
      { id: 'l-two', kind: 'reachLow', name: 'Touch the Ground', icon: '🌱', hands: 2 },
      { id: 'l-flower', kind: 'reachLow', name: 'Pick a Flower', icon: '🌸', hands: 1 },
      { id: 'l-dig', kind: 'reachLow', name: 'Dig Down', icon: '⛏️', hands: 2 },
      { id: 'l-ball', kind: 'shape', name: 'Tiny Seed', icon: '🌰', shape: 'ball' },
    ],
    collectible: '🌸',
    hintText: 'Bend down and reach your hands low!',
    positionCue: 'Stand back with room to bend — then reach down low!',
    voiceIntro: 'Down low! Bend and reach toward the ground to find treasures!',
    voicePlan: 'Get ready to reach down low…',
    voiceComplete: 'Wonderful digging! You found every treasure!',
    congrats: 'Low Reach Hero!',
    skillTags: SKILL,
  },
  sideReach: {
    title: 'Side Reach',
    subtitle: 'Reach out to the side to catch the targets!',
    emoji: '↔️',
    hero: '🐠',
    accent: '#06B6D4',
    glow: 'rgba(6,182,212,0.55)',
    bgGradient: ['#083344', '#0E7490', '#0891B2', '#67E8F9'],
    rounds: 6,
    positions: [
      { id: 's-left', kind: 'reachSide', name: 'Reach Left', icon: '🐠', side: 'left' },
      { id: 's-right', kind: 'reachSide', name: 'Reach Right', icon: '🐡', side: 'right' },
      { id: 's-left2', kind: 'reachSide', name: 'Catch Left Fish', icon: '🦀', side: 'left' },
      { id: 's-right2', kind: 'reachSide', name: 'Catch Right Fish', icon: '🐙', side: 'right' },
    ],
    collectible: '🐠',
    hintText: 'Reach your arm out to the glowing side!',
    positionCue: 'Stand back with room either side — then reach out!',
    voiceIntro: 'Reach to the sides! Stretch your arm out to catch each sea friend!',
    voicePlan: 'Get ready to reach to the side…',
    voiceComplete: 'Super reaching! You caught them all!',
    congrats: 'Side Reach Hero!',
    skillTags: SKILL,
  },
  turnPosition: {
    title: 'Turn Position',
    subtitle: 'Turn your body to face the glowing planet!',
    emoji: '🌀',
    hero: '🪐',
    accent: '#A855F7',
    glow: 'rgba(168,85,247,0.55)',
    bgGradient: ['#1E1B4B', '#4338CA', '#7C3AED', '#C4B5FD'],
    rounds: 6,
    positions: [
      { id: 't-left', kind: 'turn', name: 'Turn Left', icon: '↺', side: 'left' },
      { id: 't-right', kind: 'turn', name: 'Turn Right', icon: '↻', side: 'right' },
      { id: 't-planet', kind: 'turn', name: 'Spin to the Planet', icon: '🪐', side: 'left' },
      { id: 't-star', kind: 'turn', name: 'Spin to the Star', icon: '🌟', side: 'right' },
    ],
    collectible: '🪐',
    hintText: 'Turn your body sideways and hold the turn!',
    positionCue: 'Stand back so the camera sees your shoulders — then turn!',
    voiceIntro: 'Turn time! Twist your body to face each glowing planet!',
    voicePlan: 'Get ready to turn your body…',
    voiceComplete: 'Great turning! You spun to every planet!',
    congrats: 'Turn Position Hero!',
    skillTags: SKILL,
  },
  shapeBody: {
    title: 'Shape Body',
    subtitle: 'Make your body into each amazing shape!',
    emoji: '✨',
    hero: '✨',
    accent: '#F472B6',
    glow: 'rgba(244,114,182,0.55)',
    bgGradient: ['#3B0764', '#9D174D', '#DB2777', '#FBCFE8'],
    rounds: 6,
    positions: [
      { id: 'sh-star', kind: 'shape', name: 'Big Star', icon: '⭐', shape: 'star' },
      { id: 'sh-tall', kind: 'shape', name: 'Tall Tree', icon: '🌲', shape: 'tall' },
      { id: 'sh-ball', kind: 'shape', name: 'Little Ball', icon: '⚽', shape: 'ball' },
      { id: 'sh-wide', kind: 'shape', name: 'Wide Wings', icon: '🦅', shape: 'wide' },
      { id: 'sh-up', kind: 'reachHigh', name: 'Reach-Up Shape', icon: '🙌', hands: 2 },
    ],
    collectible: '✨',
    hintText: 'Make your body into the shape and hold it!',
    positionCue: 'Stand back so the camera sees your whole body — then make the shape!',
    voiceIntro: 'Shape time! Turn your body into each amazing shape!',
    voicePlan: 'Get ready to make the shape…',
    voiceComplete: 'Amazing shapes! You made every one!',
    congrats: 'Shape Body Hero!',
    skillTags: SKILL,
  },
};
