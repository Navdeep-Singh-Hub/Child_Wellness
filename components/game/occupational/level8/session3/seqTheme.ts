/**
 * OT Level 8 · Session 3 — "Multi-Step Sequencing" (Praxis Lab III)
 *
 * Five camera-tracked movement adventures. Each round the child must remember
 * and perform an ORDERED CHAIN of 2–5 actions (reach a chain of stars, follow a
 * pirate command list, copy a rainbow sequence…). Pose tracking scores sequence
 * accuracy, completion and movement quality.
 *
 * Builds on the shared Level 8 movement primitives.
 */
import type { ActionKind, Anchor } from '@/components/game/occupational/level8/motorActions';

export type SeqMode = 'actionChain' | 'starSequence' | 'missionSteps' | 'pirateCommands' | 'rainbowSequence';

export const RAINBOW_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7'] as const;

export const SEQ_SHELL = {
  backText: '#A7F3D0',
  backBorder: 'rgba(167,243,208,0.4)',
  statLabel: '#6EE7B7',
  statValue: '#D1FAE5',
  statBorder: 'rgba(110,231,183,0.4)',
  sparkleColor: '#FEF08A',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
} as const;

export type SeqGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  rounds: number;
  /** Inclusive chain-length range; grows across rounds. */
  minLen: number;
  maxLen: number;
  /** 'reachSeq' = every step reaches a distinct anchor; 'mixed' = pick from pool. */
  builder: 'reachSeq' | 'mixed';
  /** Action pool for 'mixed' builders. */
  pool?: ActionKind[];
  /** Reach anchors used by reach/touch steps. */
  anchors: Anchor[];
  /** Colour each targeted step like a rainbow. */
  rainbow?: boolean;
  /** Themed label/icon overrides per action (e.g. pirate commands). */
  labelMap?: Partial<Record<ActionKind, { label: string; icon: string }>>;
  collectible: string;
  hintText: string;
  positionCue: string;
  voiceIntro: string;
  voicePlan: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

const MID_ANCHORS: Anchor[] = [
  { x: 0.5, y: 0.3 },
  { x: 0.76, y: 0.4 },
  { x: 0.24, y: 0.4 },
  { x: 0.66, y: 0.22 },
  { x: 0.34, y: 0.22 },
  { x: 0.5, y: 0.48 },
];

const SKY_ANCHORS: Anchor[] = [
  { x: 0.5, y: 0.14 },
  { x: 0.24, y: 0.2 },
  { x: 0.76, y: 0.2 },
  { x: 0.38, y: 0.12 },
  { x: 0.62, y: 0.12 },
  { x: 0.5, y: 0.26 },
];

const RAINBOW_ANCHORS: Anchor[] = [
  { x: 0.18, y: 0.34 },
  { x: 0.34, y: 0.22 },
  { x: 0.5, y: 0.18 },
  { x: 0.66, y: 0.22 },
  { x: 0.82, y: 0.34 },
  { x: 0.5, y: 0.46 },
];

export const SEQ_GAME_THEMES: Record<SeqMode, SeqGameTheme> = {
  actionChain: {
    title: 'Action Chain',
    subtitle: 'Memorise the chain, then perform every action in order!',
    emoji: '🔗',
    hero: '⚡',
    accent: '#22D3EE',
    accentDeep: '#0E7490',
    glow: 'rgba(34,211,238,0.55)',
    bgGradient: ['#042F2E', '#0E7490', '#7C3AED', '#22D3EE'],
    decor: ['🔗', '⚡', '✨', '👏', '🦘', '🌀'],
    rounds: 5,
    minLen: 2,
    maxLen: 4,
    builder: 'mixed',
    pool: ['clap', 'jump', 'turn', 'reach'],
    anchors: MID_ANCHORS,
    collectible: '⚡',
    hintText: 'Do each action in the chain, left to right!',
    positionCue: 'Stand back so the camera sees your whole body — room to move!',
    voiceIntro: 'Welcome to the Action Chain! Watch the chain of moves, then do them all in order!',
    voicePlan: 'Remember the chain, then go in order.',
    voiceComplete: 'Incredible! You completed every action chain!',
    congrats: 'Action Chain Champion!',
    skillTags: ['praxis', 'sequencing', 'motor-planning', 'working-memory', 'body-awareness'],
  },
  starSequence: {
    title: 'Star Sequence',
    subtitle: 'Reach the stars in the exact order they light up!',
    emoji: '🌟',
    hero: '🌠',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.55)',
    bgGradient: ['#0F172A', '#1E1B4B', '#4338CA', '#FACC15'],
    decor: ['🌟', '⭐', '✨', '🌙', '💫', '🌠'],
    rounds: 5,
    minLen: 2,
    maxLen: 5,
    builder: 'reachSeq',
    anchors: SKY_ANCHORS,
    labelMap: { reach: { label: 'Star', icon: '⭐' } },
    collectible: '🌟',
    hintText: 'Reach each star in the order they appear!',
    positionCue: 'Stand tall with room to reach up high — follow the stars!',
    voiceIntro: 'Follow the star sequence! Reach each star in the exact order it lights up!',
    voicePlan: 'Watch the order, then reach the stars one by one.',
    voiceComplete: 'Stellar! You reached every star sequence!',
    congrats: 'Star Sequence Master!',
    skillTags: ['praxis', 'sequencing', 'motor-planning', 'visual-sequencing', 'reach-accuracy'],
  },
  missionSteps: {
    title: 'Mission Steps',
    subtitle: 'Complete the mission — every step of the launch sequence in order!',
    emoji: '🛰️',
    hero: '👨‍🚀',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.55)',
    bgGradient: ['#020617', '#0F172A', '#1D4ED8', '#38BDF8'],
    decor: ['🛰️', '🚀', '⭐', '🪐', '✨', '🌑'],
    rounds: 5,
    minLen: 2,
    maxLen: 4,
    builder: 'mixed',
    pool: ['launch', 'reach', 'freeze', 'jump'],
    anchors: SKY_ANCHORS,
    labelMap: {
      launch: { label: 'Lift Off', icon: '🚀' },
      reach: { label: 'Grab', icon: '🛰️' },
      freeze: { label: 'Hold', icon: '🧊' },
      jump: { label: 'Boost', icon: '🦘' },
    },
    collectible: '🛰️',
    hintText: 'Follow each mission step in order to complete the launch!',
    positionCue: 'Stand back so the camera sees your whole body — mission ready!',
    voiceIntro: 'Mission control! Follow every step of the launch sequence in the right order!',
    voicePlan: 'Remember the mission steps, then go in order.',
    voiceComplete: 'Mission complete! You followed every step!',
    congrats: 'Mission Steps Commander!',
    skillTags: ['praxis', 'sequencing', 'motor-planning', 'working-memory', 'coordination'],
  },
  pirateCommands: {
    title: 'Pirate Commands',
    subtitle: 'Aye aye! Follow the captain’s command list in order!',
    emoji: '🏴‍☠️',
    hero: '🦜',
    accent: '#F59E0B',
    accentDeep: '#92400E',
    glow: 'rgba(245,158,11,0.55)',
    bgGradient: ['#0C1929', '#1E3A5F', '#92400E', '#F59E0B'],
    decor: ['🏴‍☠️', '🦜', '⚓', '🗺️', '💰', '🌊'],
    rounds: 5,
    minLen: 2,
    maxLen: 4,
    builder: 'mixed',
    pool: ['turn', 'jump', 'clap', 'reach'],
    anchors: MID_ANCHORS,
    labelMap: {
      turn: { label: 'Steer', icon: '🌀' },
      jump: { label: 'Jump Wave', icon: '🌊' },
      clap: { label: 'Hoist', icon: '👏' },
      reach: { label: 'Treasure', icon: '💰' },
    },
    collectible: '💰',
    hintText: 'Follow the captain’s commands in order, matey!',
    positionCue: 'Stand back on the deck — room to steer, jump and reach!',
    voiceIntro: 'Aye aye, captain! Listen to the command list, then follow every order in sequence!',
    voicePlan: 'Remember the captain’s orders, then follow them in order.',
    voiceComplete: 'Arr! You followed every command, brave sailor!',
    congrats: 'Pirate Command Captain!',
    skillTags: ['praxis', 'sequencing', 'motor-planning', 'working-memory', 'body-awareness'],
  },
  rainbowSequence: {
    title: 'Rainbow Sequence',
    subtitle: 'Touch the rainbow colours in the order they glow!',
    emoji: '🌈',
    hero: '🎨',
    accent: '#A855F7',
    accentDeep: '#6B21A8',
    glow: 'rgba(168,85,247,0.55)',
    bgGradient: ['#1E1B4B', '#7C3AED', '#DB2777', '#F59E0B'],
    decor: ['🌈', '🎨', '✨', '🟥', '🟦', '🟩'],
    rounds: 5,
    minLen: 2,
    maxLen: 5,
    builder: 'reachSeq',
    anchors: RAINBOW_ANCHORS,
    rainbow: true,
    labelMap: { touch: { label: 'Colour', icon: '⬤' }, reach: { label: 'Colour', icon: '⬤' } },
    collectible: '🌈',
    hintText: 'Touch each rainbow colour in the right order!',
    positionCue: 'Stand back so the camera sees your arms — follow the colours!',
    voiceIntro: 'Paint the rainbow! Touch each colour in the exact order it glows!',
    voicePlan: 'Watch the colour order, then touch them one by one.',
    voiceComplete: 'Beautiful! You painted every rainbow sequence!',
    congrats: 'Rainbow Sequence Artist!',
    skillTags: ['praxis', 'sequencing', 'motor-planning', 'visual-sequencing', 'reach-accuracy'],
  },
};
