/**
 * OT Level 8 · Session 10 — "Praxis Adventure" (Level 8 Grand Finale)
 *
 * Five integrated expeditions — each is one epic adventure sequence mixing every
 * praxis skill from Sessions 1–9 (reach, two-step, chain, imitate, novel…).
 */
import type { PuzzleMove } from '@/components/game/occupational/level8/session8/puzzleSolve';
import type { PraxisBeat } from '@/components/game/occupational/level8/session10/praxisAdventure';

export type AdventureMode =
  | 'jungleExpedition'
  | 'spaceExplorer'
  | 'pirateTreasureHunt'
  | 'mountainMission'
  | 'praxisChampion';

export const ADVENTURE_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.45)',
  statLabel: '#FCD34D',
  statValue: '#FEF3C7',
  statBorder: 'rgba(252,211,77,0.45)',
  sparkleColor: '#FBBF24',
  pathLine: 'rgba(255,255,255,0.38)',
  gold: '#FBBF24',
} as const;

export type AdventureGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  glow: string;
  bgGradient: [string, string, string, string];
  beats: PraxisBeat[];
  collectible: string;
  hintText: string;
  positionCue: string;
  voiceIntro: string;
  voicePlan: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

const SKILL = ['praxis', 'motor-planning', 'sequencing', 'body-awareness', 'integration'];

const M = (id: string, label: string, icon: string, kind: PuzzleMove['kind']): PuzzleMove => ({
  id,
  label,
  icon,
  kind,
});

const UP = M('up', 'Reach Up', '⬆️', 'reachHigh');
const LOW = M('low', 'Reach Down', '⬇️', 'reachLow');
const LEFT = M('left', 'Reach Left', '⬅️', 'reachSideLeft');
const RIGHT = M('right', 'Reach Right', '➡️', 'reachSideRight');
const TURN = M('turn', 'Turn', '🌀', 'turn');
const JUMP = M('jump', 'Jump', '🦘', 'jump');
const CLAP = M('clap', 'Clap', '👏', 'clap');
const FREEZE = M('freeze', 'Freeze', '🧊', 'freeze');
const LAUNCH = M('launch', 'Launch', '🙌', 'launch');
const BOTH = M('both', 'Both Up', '🙌', 'bothUp');
const WINGS = M('wings', 'Wings Out', '🦅', 'bothOut');
const CROSS = M('cross', 'Cross Clap', '✖️', 'crossClap');

const B = (id: string, name: string, icon: string, beatEval: PraxisBeat['eval']): PraxisBeat => ({
  id,
  name,
  icon,
  eval: beatEval,
});

export const ADVENTURE_GAME_THEMES: Record<AdventureMode, AdventureGameTheme> = {
  jungleExpedition: {
    title: 'Jungle Expedition',
    subtitle: 'Cross the jungle — every praxis skill on one epic trail!',
    emoji: '🌴',
    hero: '🐯',
    accent: '#22C55E',
    glow: 'rgba(34,197,94,0.55)',
    bgGradient: ['#052E16', '#166534', '#15803D', '#BEF264'],
    beats: [
      B('j1', 'Touch the Canopy', '🌳', { type: 'move', move: UP }),
      B('j2', 'Duck the Vine', '🌿', { type: 'move', move: LOW }),
      B('j3', 'Monkey Cross', '🐒', { type: 'two', a: LEFT, b: JUMP }),
      B('j4', 'Jungle Drum', '🥁', { type: 'chain', moves: [CLAP, UP, FREEZE] }),
      B('j5', 'Parrot Wings', '🦜', { type: 'imitate', left: 'out', right: 'out' }),
      B('j6', 'Alien Vine', '👽', { type: 'novel', kind: 'alienAntenna' }),
      B('j7', 'Tarzan Finish', '🌴', { type: 'move', move: WINGS }),
    ],
    collectible: '🐯',
    hintText: 'Complete every mission on the jungle trail!',
    positionCue: 'Stand back so the camera sees your whole body on the trail!',
    voiceIntro: 'Jungle expedition! Complete every praxis mission on the trail!',
    voicePlan: 'Study the expedition plan…',
    voiceComplete: 'You crossed the whole jungle! Expedition champion!',
    congrats: 'Jungle Expedition Champion!',
    skillTags: SKILL,
  },
  spaceExplorer: {
    title: 'Space Explorer',
    subtitle: 'Blast through space missions — use every skill you learned!',
    emoji: '🚀',
    hero: '🛸',
    accent: '#818CF8',
    glow: 'rgba(129,140,248,0.55)',
    bgGradient: ['#0F0A2E', '#312E81', '#4F46E5', '#A5B4FC'],
    beats: [
      B('s1', 'Rocket Launch', '🚀', { type: 'move', move: LAUNCH }),
      B('s2', 'Spin to Planet', '🪐', { type: 'move', move: TURN }),
      B('s3', 'Float & Jump', '🛸', { type: 'two', a: FREEZE, b: JUMP }),
      B('s4', 'Star Chain', '⭐', { type: 'chain', moves: [UP, CLAP, LAUNCH] }),
      B('s5', 'Alien Greeting', '👽', { type: 'novel', kind: 'alienFloat' }),
      B('s6', 'Orbit Reach', '🌌', { type: 'move', move: RIGHT }),
      B('s7', 'Space Hero', '🏅', { type: 'imitate', left: 'up', right: 'up' }),
    ],
    collectible: '🚀',
    hintText: 'Complete each space mission in order!',
    positionCue: 'Stand ready for launch — room to move all around!',
    voiceIntro: 'Space explorer! Complete every mission across the galaxy!',
    voicePlan: 'Plot your course through the stars…',
    voiceComplete: 'Galaxy explored! You are a space praxis hero!',
    congrats: 'Space Explorer Champion!',
    skillTags: SKILL,
  },
  pirateTreasureHunt: {
    title: 'Pirate Treasure Hunt',
    subtitle: 'Follow the treasure map — praxis skills lead to gold!',
    emoji: '🏴‍☠️',
    hero: '💰',
    accent: '#F59E0B',
    glow: 'rgba(245,158,11,0.55)',
    bgGradient: ['#1C1917', '#78350F', '#B45309', '#FDE68A'],
    beats: [
      B('p1', 'Grab the Rope', '⚓', { type: 'move', move: LEFT }),
      B('p2', 'Balance Plank', '🪵', { type: 'move', move: FREEZE }),
      B('p3', 'Clap & Turn', '🏴‍☠️', { type: 'two', a: CLAP, b: TURN }),
      B('p4', 'Duck the Trap', '💀', { type: 'move', move: LOW }),
      B('p5', 'Cross Clap Code', '✖️', { type: 'move', move: CROSS }),
      B('p6', 'Treasure Chain', '💰', { type: 'chain', moves: [LEFT, RIGHT, CLAP] }),
      B('p7', 'Island Wave', '🌊', { type: 'novel', kind: 'islandWave' }),
    ],
    collectible: '💰',
    hintText: 'Follow the map and complete each pirate mission!',
    positionCue: 'Stand with room to balance, reach and turn!',
    voiceIntro: 'Ahoy! Hunt the treasure — complete every mission on the map!',
    voicePlan: 'Study the treasure map, matey…',
    voiceComplete: 'Treasure found! You mastered the pirate praxis quest!',
    congrats: 'Pirate Treasure Champion!',
    skillTags: SKILL,
  },
  mountainMission: {
    title: 'Mountain Mission',
    subtitle: 'Climb the mountain — integrated praxis all the way up!',
    emoji: '⛰️',
    hero: '🧗',
    accent: '#38BDF8',
    glow: 'rgba(56,189,248,0.55)',
    bgGradient: ['#0F172A', '#334155', '#0369A1', '#E0F2FE'],
    beats: [
      B('m1', 'Climb High', '🧗', { type: 'move', move: UP }),
      B('m2', 'Pass Turn', '🌀', { type: 'move', move: TURN }),
      B('m3', 'Low Crawl', '🪨', { type: 'move', move: LOW }),
      B('m4', 'Summit Chain', '🏔️', { type: 'chain', moves: [TURN, LOW, UP] }),
      B('m5', 'Eagle Pose', '🦅', { type: 'imitate', left: 'up', right: 'down' }),
      B('m6', 'Robot Spin', '⚙️', { type: 'novel', kind: 'robotSpin' }),
      B('m7', 'Peak Freeze', '❄️', { type: 'two', a: FREEZE, b: BOTH }),
    ],
    collectible: '🏔️',
    hintText: 'Climb each mountain mission to reach the summit!',
    positionCue: 'Stand back with room to climb, turn and crouch!',
    voiceIntro: 'Mountain mission! Climb every praxis challenge to the summit!',
    voicePlan: 'Plan your climb…',
    voiceComplete: 'Summit reached! Incredible mountain praxis!',
    congrats: 'Mountain Mission Champion!',
    skillTags: SKILL,
  },
  praxisChampion: {
    title: 'Praxis Champion',
    subtitle: 'The ultimate finale — every Level 8 skill in one epic quest!',
    emoji: '🏆',
    hero: '👑',
    accent: '#FBBF24',
    glow: 'rgba(251,191,36,0.6)',
    bgGradient: ['#0C0A09', '#B45309', '#7C3AED', '#FDE68A'],
    beats: [
      B('c1', 'Reach the Star', '⭐', { type: 'move', move: UP }),
      B('c2', 'Two-Step Blast', '⚡', { type: 'two', a: CLAP, b: JUMP }),
      B('c3', 'Action Chain', '🔗', { type: 'chain', moves: [UP, TURN, FREEZE] }),
      B('c4', 'Mirror Pose', '🪞', { type: 'imitate', left: 'up', right: 'down' }),
      B('c5', 'Duck & Climb', '🌿', { type: 'two', a: LOW, b: UP }),
      B('c6', 'Twin Wings', '🦅', { type: 'move', move: WINGS }),
      B('c7', 'Cross Champion', '✖️', { type: 'move', move: CROSS }),
      B('c8', 'Novel Power', '🌟', { type: 'novel', kind: 'questPowerClap' }),
      B('c9', 'Surprise Leap', '🦘', { type: 'move', move: JUMP }),
      B('c10', 'Champion Freeze', '👑', { type: 'chain', moves: [BOTH, FREEZE, CLAP] }),
    ],
    collectible: '🏆',
    hintText: 'This is the final quest — use EVERY praxis skill!',
    positionCue: 'Stand ready — the ultimate praxis adventure awaits!',
    voiceIntro: 'Praxis Champion quest! Use every skill from Level 8 to win gold!',
    voicePlan: 'This is the final adventure…',
    voiceComplete: 'You are the Praxis Champion! You mastered Level 8!',
    congrats: 'Praxis Champion!',
    skillTags: [...SKILL, 'champion'],
  },
};
