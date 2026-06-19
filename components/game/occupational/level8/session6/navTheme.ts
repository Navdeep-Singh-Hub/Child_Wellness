/**
 * OT Level 8 · Session 6 — "Obstacle Navigation" (Trail Quest)
 *
 * Five camera-tracked path adventures. Each round the child navigates a themed
 * trail gate-by-gate — duck under vines, jump lava gaps, climb mountain rocks,
 * weave through space, cross pirate planks. Pose tracking scores navigation
 * accuracy, completion and movement quality.
 */
import type { ObstacleGate, ObstacleKind } from '@/components/game/occupational/level8/session6/obstacleNav';
import { pathAnchors } from '@/components/game/occupational/level8/session6/obstacleNav';

export type NavMode = 'junglePath' | 'lavaEscape' | 'mountainRoute' | 'spaceMaze' | 'pirateIsland';

export const NAV_SHELL = {
  backText: '#BBF7D0',
  backBorder: 'rgba(187,247,208,0.4)',
  statLabel: '#6EE7B7',
  statValue: '#D1FAE5',
  statBorder: 'rgba(110,231,183,0.4)',
  sparkleColor: '#FEF08A',
  pathLine: 'rgba(255,255,255,0.35)',
} as const;

export type ObstacleDef = { kind: ObstacleKind; name: string; icon: string };

export type NavGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  rounds: number;
  minGates: number;
  maxGates: number;
  /** Ordered obstacle pool for this adventure (cycled / shuffled per path). */
  obstacles: ObstacleDef[];
  collectible: string;
  hintText: string;
  positionCue: string;
  voiceIntro: string;
  voicePlan: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

const SKILL = ['praxis', 'motor-planning', 'sequencing', 'body-awareness', 'coordination'];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

/** Build the gate sequence for one round; path length grows every 2 rounds. */
export function buildPath(theme: NavGameTheme, round: number): ObstacleGate[] {
  const len = Math.min(theme.maxGates, theme.minGates + Math.floor(round / 2));
  const anchors = pathAnchors(len);
  const pool = shuffle(theme.obstacles);
  const gates: ObstacleGate[] = [];
  let lastKind: ObstacleKind | null = null;

  for (let i = 0; i < len; i++) {
    let def = pool[i % pool.length]!;
    let guard = 0;
    while (def.kind === lastKind && guard++ < 6) def = pool[(i + guard) % pool.length]!;
    lastKind = def.kind;
    gates.push({
      id: `${def.kind}-${i}`,
      kind: def.kind,
      name: def.name,
      icon: def.icon,
      anchor: anchors[i]!,
    });
  }
  return gates;
}

export const NAV_GAME_THEMES: Record<NavMode, NavGameTheme> = {
  junglePath: {
    title: 'Jungle Path',
    subtitle: 'Navigate the wild jungle trail — duck, climb and jump!',
    emoji: '🌴',
    hero: '🦜',
    accent: '#22C55E',
    glow: 'rgba(34,197,94,0.55)',
    bgGradient: ['#052E16', '#166534', '#15803D', '#4ADE80'],
    decor: ['🌴', '🦜', '🐍', '🌿', '🦋', '🍃'],
    rounds: 5,
    minGates: 3,
    maxGates: 5,
    obstacles: [
      { kind: 'duck', name: 'Duck Under Vine', icon: '🌿' },
      { kind: 'jump', name: 'Jump the Log', icon: '🪵' },
      { kind: 'climb', name: 'Climb the Branch', icon: '🌳' },
      { kind: 'swerveLeft', name: 'Dodge Left', icon: '🐍' },
      { kind: 'swerveRight', name: 'Dodge Right', icon: '🦎' },
      { kind: 'step', name: 'Cross the Stream', icon: '💧' },
    ],
    collectible: '🦜',
    hintText: 'Clear each jungle obstacle to move along the path!',
    positionCue: 'Stand back so the camera sees your whole body — then navigate!',
    voiceIntro: 'Welcome to the jungle! Navigate the trail and clear every obstacle!',
    voicePlan: 'Study the path… get ready to move!',
    voiceComplete: 'Amazing! You conquered the jungle trail!',
    congrats: 'Jungle Path Explorer!',
    skillTags: SKILL,
  },
  lavaEscape: {
    title: 'Lava Escape',
    subtitle: 'Escape the volcano — duck heat, jump gaps and balance!',
    emoji: '🌋',
    hero: '🔥',
    accent: '#F97316',
    glow: 'rgba(249,115,22,0.55)',
    bgGradient: ['#450A0A', '#9A3412', '#EA580C', '#FDBA74'],
    decor: ['🌋', '🔥', '💨', '🪨', '⚡', '🧡'],
    rounds: 5,
    minGates: 3,
    maxGates: 5,
    obstacles: [
      { kind: 'duck', name: 'Duck the Heat', icon: '🔥' },
      { kind: 'jump', name: 'Jump the Gap', icon: '💥' },
      { kind: 'balance', name: 'Balance on Rock', icon: '🪨' },
      { kind: 'step', name: 'Step on Stone', icon: '🪨' },
      { kind: 'swerveLeft', name: 'Swerve from Lava', icon: '⬅️' },
      { kind: 'climb', name: 'Climb the Wall', icon: '🧗' },
    ],
    collectible: '💎',
    hintText: 'Clear each lava obstacle to escape!',
    positionCue: 'Stand back with room to jump and duck — escape the lava!',
    voiceIntro: 'The volcano is erupting! Escape by clearing each obstacle on the path!',
    voicePlan: 'Plan your escape route…',
    voiceComplete: 'You escaped the lava! Incredible!',
    congrats: 'Lava Escape Hero!',
    skillTags: SKILL,
  },
  mountainRoute: {
    title: 'Mountain Route',
    subtitle: 'Climb the mountain — reach high, turn and balance on ledges!',
    emoji: '⛰️',
    hero: '🏔️',
    accent: '#94A3B8',
    glow: 'rgba(148,163,184,0.55)',
    bgGradient: ['#0F172A', '#334155', '#64748B', '#E2E8F0'],
    decor: ['⛰️', '🏔️', '❄️', '🦅', '⛺', '🌨️'],
    rounds: 5,
    minGates: 3,
    maxGates: 5,
    obstacles: [
      { kind: 'climb', name: 'Climb the Rock', icon: '🧗' },
      { kind: 'turn', name: 'Turn at the Pass', icon: '🌀' },
      { kind: 'balance', name: 'Balance on Ledge', icon: '🧊' },
      { kind: 'step', name: 'Step on Ledge', icon: '👣' },
      { kind: 'duck', name: 'Duck Under Cliff', icon: '🪨' },
      { kind: 'jump', name: 'Leap the Crevice', icon: '💫' },
    ],
    collectible: '🏔️',
    hintText: 'Clear each mountain obstacle to climb higher!',
    positionCue: 'Stand back so the camera sees you — climb the mountain!',
    voiceIntro: 'Mountain mission! Navigate the route and conquer each obstacle!',
    voicePlan: 'Study the mountain path…',
    voiceComplete: 'You reached the summit! Magnificent climbing!',
    congrats: 'Mountain Route Champion!',
    skillTags: SKILL,
  },
  spaceMaze: {
    title: 'Space Maze',
    subtitle: 'Weave through the space maze — dodge, turn and boost!',
    emoji: '🚀',
    hero: '🛸',
    accent: '#818CF8',
    glow: 'rgba(129,140,248,0.55)',
    bgGradient: ['#0F0A2E', '#312E81', '#4F46E5', '#A5B4FC'],
    decor: ['🚀', '🛸', '⭐', '🌌', '💫', '🪐'],
    rounds: 5,
    minGates: 3,
    maxGates: 5,
    obstacles: [
      { kind: 'duck', name: 'Duck Asteroid', icon: '☄️' },
      { kind: 'turn', name: 'Turn at Portal', icon: '🌀' },
      { kind: 'step', name: 'Touch the Star', icon: '⭐' },
      { kind: 'jump', name: 'Boost Jump', icon: '🚀' },
      { kind: 'swerveRight', name: 'Swerve Right', icon: '➡️' },
      { kind: 'climb', name: 'Reach Up', icon: '🛸' },
    ],
    collectible: '⭐',
    hintText: 'Clear each space gate to navigate the maze!',
    positionCue: 'Stand back with room to move — navigate the space maze!',
    voiceIntro: 'Blast off! Navigate the space maze and clear every gate!',
    voicePlan: 'Plot your course through the maze…',
    voiceComplete: 'Mission complete! You navigated the space maze!',
    congrats: 'Space Maze Pilot!',
    skillTags: SKILL,
  },
  pirateIsland: {
    title: 'Pirate Island',
    subtitle: 'Cross the island — balance planks, dodge traps and find treasure!',
    emoji: '🏴‍☠️',
    hero: '🦜',
    accent: '#F59E0B',
    glow: 'rgba(245,158,11,0.55)',
    bgGradient: ['#1C1917', '#78350F', '#B45309', '#FCD34D'],
    decor: ['🏴‍☠️', '🦜', '⚓', '🏝️', '💰', '🌊'],
    rounds: 5,
    minGates: 3,
    maxGates: 5,
    obstacles: [
      { kind: 'balance', name: 'Balance the Plank', icon: '🪵' },
      { kind: 'duck', name: 'Duck the Trap', icon: '💀' },
      { kind: 'step', name: 'Step to Treasure', icon: '💰' },
      { kind: 'swerveLeft', name: 'Dodge Left', icon: '⬅️' },
      { kind: 'jump', name: 'Jump the Gap', icon: '🌊' },
      { kind: 'turn', name: 'Turn at the Dock', icon: '⚓' },
    ],
    collectible: '💰',
    hintText: 'Clear each island obstacle to reach the treasure!',
    positionCue: 'Stand back with room to balance and jump — cross the island!',
    voiceIntro: 'Ahoy! Navigate the pirate island and clear every obstacle to the treasure!',
    voicePlan: 'Study the island path, matey…',
    voiceComplete: 'Shiver me timbers! You found the treasure!',
    congrats: 'Pirate Island Captain!',
    skillTags: SKILL,
  },
};
