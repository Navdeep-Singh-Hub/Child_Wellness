/**
 * OT Level 8 · Session 8 — "Movement Problem Solving" (Puzzle Quest)
 *
 * Five camera-tracked problem-solving adventures. Each round shows a movement
 * puzzle with a clue and three possible solutions — the child must READ the
 * problem, PLAN the right move and PERFORM it. Pose tracking scores problem-
 * solving accuracy, completion and movement quality.
 */
import {
  buildPuzzleRound,
  type PuzzleMove,
  type PuzzleRound,
} from '@/components/game/occupational/level8/session8/puzzleSolve';

export type PuzzleMode = 'findTheRoute' | 'openThePath' | 'movementPuzzle' | 'rescueMission' | 'escapeCourse';

export const PUZZLE_SHELL = {
  backText: '#E9D5FF',
  backBorder: 'rgba(233,213,255,0.4)',
  statLabel: '#D8B4FE',
  statValue: '#F3E8FF',
  statBorder: 'rgba(216,180,254,0.4)',
  sparkleColor: '#FEF08A',
} as const;

export type PuzzleDef = {
  id: string;
  clue: string;
  prompt: string;
  correct: PuzzleMove;
  distractors: PuzzleMove[];
};

export type PuzzleGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  glow: string;
  bgGradient: [string, string, string, string];
  rounds: number;
  puzzles: PuzzleDef[];
  collectible: string;
  hintText: string;
  positionCue: string;
  voiceIntro: string;
  voiceThink: string;
  voiceComplete: string;
  voiceWrong: string;
  congrats: string;
  skillTags: string[];
};

const SKILL = ['praxis', 'problem-solving', 'motor-planning', 'sequencing', 'body-awareness'];

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
const TURN = M('turn', 'Turn Body', '🌀', 'turn');
const JUMP = M('jump', 'Jump', '🦘', 'jump');
const CLAP = M('clap', 'Clap', '👏', 'clap');
const FREEZE = M('freeze', 'Freeze', '🧊', 'freeze');
const LAUNCH = M('launch', 'Arms Up', '🙌', 'launch');
const BOTH = M('both', 'Both Arms Up', '🙌', 'bothUp');
const WINGS = M('wings', 'Wings Out', '🦅', 'bothOut');
const CROSS = M('cross', 'Cross Clap', '✖️', 'crossClap');
const BEAR = M('bear', 'Bear Down', '🐻', 'bear');

export function pickPuzzle(theme: PuzzleGameTheme, round: number): PuzzleRound {
  const idx = round % theme.puzzles.length;
  const p = theme.puzzles[idx]!;
  return buildPuzzleRound(p.id, p.clue, p.prompt, p.correct, p.distractors);
}

export const PUZZLE_GAME_THEMES: Record<PuzzleMode, PuzzleGameTheme> = {
  findTheRoute: {
    title: 'Find The Route',
    subtitle: 'Read the map clue — which move finds the route?',
    emoji: '🗺️',
    hero: '🧭',
    accent: '#38BDF8',
    glow: 'rgba(56,189,248,0.55)',
    bgGradient: ['#0C4A6E', '#1D4ED8', '#0369A1', '#7DD3FC'],
    rounds: 6,
    puzzles: [
      {
        id: 'fr-1',
        clue: '🗺️ The treasure is HIGH in the sky!',
        prompt: 'Which move reaches the sky route?',
        correct: UP,
        distractors: [LOW, TURN],
      },
      {
        id: 'fr-2',
        clue: '🗺️ The tunnel is LOW under the ground!',
        prompt: 'Which move finds the low tunnel?',
        correct: LOW,
        distractors: [UP, JUMP],
      },
      {
        id: 'fr-3',
        clue: '🗺️ The path turns to the LEFT!',
        prompt: 'Which move follows the left path?',
        correct: LEFT,
        distractors: [RIGHT, CLAP],
      },
      {
        id: 'fr-4',
        clue: '🗺️ A wide bridge needs BOTH arms stretched!',
        prompt: 'Which move crosses the wide bridge?',
        correct: WINGS,
        distractors: [BEAR, FREEZE],
      },
      {
        id: 'fr-5',
        clue: '🗺️ Jump over the river to continue!',
        prompt: 'Which move crosses the river?',
        correct: JUMP,
        distractors: [FREEZE, LOW],
      },
    ],
    collectible: '🧭',
    hintText: 'Read the clue, pick the right move and hold it!',
    positionCue: 'Stand back so the camera sees your whole body!',
    voiceIntro: 'Explorer! Read each map clue and find the right move for the route!',
    voiceThink: 'Study the clue… which move solves it?',
    voiceComplete: 'Brilliant navigating! You found every route!',
    voiceWrong: 'Not that move — read the clue again!',
    congrats: 'Route Finder Champion!',
    skillTags: SKILL,
  },
  openThePath: {
    title: 'Open The Path',
    subtitle: 'Solve each lock — perform the key move to open the path!',
    emoji: '🔓',
    hero: '🗝️',
    accent: '#FBBF24',
    glow: 'rgba(251,191,36,0.55)',
    bgGradient: ['#422006', '#B45309', '#D97706', '#FDE68A'],
    rounds: 6,
    puzzles: [
      {
        id: 'op-1',
        clue: '🔒 Locked from ABOVE — reach up for the key!',
        prompt: 'Which move opens the top lock?',
        correct: UP,
        distractors: [LOW, TURN],
      },
      {
        id: 'op-2',
        clue: '🔒 The gate needs a CLAP to open!',
        prompt: 'Which move unlocks the gate?',
        correct: CLAP,
        distractors: [FREEZE, LEFT],
      },
      {
        id: 'op-3',
        clue: '🔒 Turn the body to twist the lock!',
        prompt: 'Which move turns the lock?',
        correct: TURN,
        distractors: [JUMP, BOTH],
      },
      {
        id: 'op-4',
        clue: '🔒 Cross your arms to open the secret latch!',
        prompt: 'Which move opens the latch?',
        correct: CROSS,
        distractors: [CLAP, WINGS],
      },
      {
        id: 'op-5',
        clue: '🔒 Launch both arms up to raise the bridge!',
        prompt: 'Which move raises the bridge?',
        correct: LAUNCH,
        distractors: [BEAR, LOW],
      },
    ],
    collectible: '🗝️',
    hintText: 'Read the lock clue and perform the key move!',
    positionCue: 'Stand facing the camera with room to move!',
    voiceIntro: 'The path is locked! Read each clue and perform the key move!',
    voiceThink: 'Which move is the key?',
    voiceComplete: 'Every path is open! Amazing problem solving!',
    voiceWrong: 'That key does not fit — try another move!',
    congrats: 'Path Opener Hero!',
    skillTags: SKILL,
  },
  movementPuzzle: {
    title: 'Movement Puzzle',
    subtitle: 'Solve each movement puzzle — pick the right body move!',
    emoji: '🧩',
    hero: '🧩',
    accent: '#A855F7',
    glow: 'rgba(168,85,247,0.55)',
    bgGradient: ['#2E1065', '#6D28D9', '#9333EA', '#E9D5FF'],
    rounds: 6,
    puzzles: [
      {
        id: 'mp-1',
        clue: '🧩 Puzzle piece goes UP on the board!',
        prompt: 'Which move fits the puzzle?',
        correct: BOTH,
        distractors: [BEAR, LOW],
      },
      {
        id: 'mp-2',
        clue: '🧩 The puzzle needs you to FREEZE still!',
        prompt: 'Which move solves it?',
        correct: FREEZE,
        distractors: [JUMP, CLAP],
      },
      {
        id: 'mp-3',
        clue: '🧩 Reach to the RIGHT side piece!',
        prompt: 'Which move places the piece?',
        correct: RIGHT,
        distractors: [LEFT, TURN],
      },
      {
        id: 'mp-4',
        clue: '🧩 Duck DOWN to fit the bottom piece!',
        prompt: 'Which move completes the puzzle?',
        correct: LOW,
        distractors: [UP, LAUNCH],
      },
      {
        id: 'mp-5',
        clue: '🧩 Jump to snap the pieces together!',
        prompt: 'Which move connects the pieces?',
        correct: JUMP,
        distractors: [FREEZE, WINGS],
      },
    ],
    collectible: '🧩',
    hintText: 'Think about the clue — then do the solving move!',
    positionCue: 'Stand back so the camera sees you clearly!',
    voiceIntro: 'Puzzle time! Read each clue and solve it with the right move!',
    voiceThink: 'Think… which move solves the puzzle?',
    voiceComplete: 'Every puzzle solved! You are a movement genius!',
    voiceWrong: 'That piece does not fit — try a different move!',
    congrats: 'Movement Puzzle Master!',
    skillTags: SKILL,
  },
  rescueMission: {
    title: 'Rescue Mission',
    subtitle: 'Rescue missions need the right move — read and solve!',
    emoji: '🚁',
    hero: '🦸',
    accent: '#F472B6',
    glow: 'rgba(244,114,182,0.55)',
    bgGradient: ['#500724', '#BE185D', '#DB2777', '#FBCFE8'],
    rounds: 6,
    puzzles: [
      {
        id: 'rm-1',
        clue: '🚁 The kitten is UP in the tree!',
        prompt: 'Which move rescues the kitten?',
        correct: UP,
        distractors: [LOW, BEAR],
      },
      {
        id: 'rm-2',
        clue: '🚁 Clap to signal the rescue team!',
        prompt: 'Which move calls for help?',
        correct: CLAP,
        distractors: [FREEZE, TURN],
      },
      {
        id: 'rm-3',
        clue: '🚁 Reach LEFT to grab the rope!',
        prompt: 'Which move catches the rope?',
        correct: LEFT,
        distractors: [RIGHT, JUMP],
      },
      {
        id: 'rm-4',
        clue: '🚁 Get low like a bear to crawl under smoke!',
        prompt: 'Which move gets through the smoke?',
        correct: BEAR,
        distractors: [BOTH, LAUNCH],
      },
      {
        id: 'rm-5',
        clue: '🚁 Jump to reach the helicopter ladder!',
        prompt: 'Which move reaches the ladder?',
        correct: JUMP,
        distractors: [FREEZE, LOW],
      },
    ],
    collectible: '🦸',
    hintText: 'Read the rescue clue and perform the hero move!',
    positionCue: 'Stand with room to reach, jump and move!',
    voiceIntro: 'Rescue mission! Read each emergency clue and perform the hero move!',
    voiceThink: 'What move saves the day?',
    voiceComplete: 'Mission complete! Every rescue succeeded!',
    voiceWrong: 'That will not work — read the mission clue!',
    congrats: 'Rescue Mission Hero!',
    skillTags: SKILL,
  },
  escapeCourse: {
    title: 'Escape Course',
    subtitle: 'Escape each room — solve the movement code!',
    emoji: '🚪',
    hero: '⏱️',
    accent: '#34D399',
    glow: 'rgba(52,211,153,0.55)',
    bgGradient: ['#042F2E', '#065F46', '#059669', '#6EE7B7'],
    rounds: 6,
    puzzles: [
      {
        id: 'ec-1',
        clue: '🚪 Laser beams are LOW — duck under!',
        prompt: 'Which move escapes the lasers?',
        correct: LOW,
        distractors: [UP, BOTH],
      },
      {
        id: 'ec-2',
        clue: '🚪 The door opens when you TURN sideways!',
        prompt: 'Which move opens the door?',
        correct: TURN,
        distractors: [CLAP, JUMP],
      },
      {
        id: 'ec-3',
        clue: '🚪 Cross clap to disable the alarm!',
        prompt: 'Which move turns off the alarm?',
        correct: CROSS,
        distractors: [FREEZE, WINGS],
      },
      {
        id: 'ec-4',
        clue: '🚪 Freeze like a statue past the guards!',
        prompt: 'Which move sneaks past?',
        correct: FREEZE,
        distractors: [JUMP, CLAP],
      },
      {
        id: 'ec-5',
        clue: '🚪 Stretch WINGS wide to squeeze through!',
        prompt: 'Which move fits through the gap?',
        correct: WINGS,
        distractors: [BEAR, TURN],
      },
      {
        id: 'ec-6',
        clue: '🚪 Jump the final gap to freedom!',
        prompt: 'Which move escapes?',
        correct: JUMP,
        distractors: [LOW, FREEZE],
      },
    ],
    collectible: '⏱️',
    hintText: 'Crack the escape code with the right body move!',
    positionCue: 'Stand back with room to duck, jump and turn!',
    voiceIntro: 'Escape course! Read each room clue and crack the movement code!',
    voiceThink: 'Which move lets you escape?',
    voiceComplete: 'You escaped! Incredible problem solving!',
    voiceWrong: 'Wrong code — read the room clue again!',
    congrats: 'Escape Course Champion!',
    skillTags: SKILL,
  },
};
