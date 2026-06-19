/**
 * OT Level 8 · Session 1 — "Single-Step Motor Planning" (Praxis Lab)
 *
 * Five camera-tracked movement-adventure games. The child PLANS a single
 * movement and then EXECUTES it — reaching a hand to a target, shifting the
 * whole body onto a spot, raising both arms to launch, or carrying an object
 * from one place to another. Pose tracking scores reach accuracy, completion
 * and movement quality (smooth, controlled praxis).
 *
 * Distinct neon-lab palette (indigo → violet → teal → coral) so it reads apart
 * from Level 6 (sitting/standing) and Level 7 (warm railway/vestibular) themes.
 */

export type MotorMode = 'touchTarget' | 'reachStar' | 'moveToSpot' | 'launchRocket' | 'placeBox';

/** How a target is "completed" from the body. */
export type TargetKind =
  | 'hand' // reach either hand into the target zone
  | 'body' // shift the whole body so it stands on the spot
  | 'bothHands' // raise both hands together (launch)
  | 'twoStage'; // pick up at a source, then place at a destination

export type Anchor = { x: number; y: number };

export const MOTOR_SHELL = {
  backText: '#C4B5FD',
  backBorder: 'rgba(196,181,253,0.4)',
  statLabel: '#A5B4FC',
  statValue: '#EDE9FE',
  statBorder: 'rgba(165,180,252,0.4)',
  sparkleColor: '#FDE68A',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
} as const;

export type MotorGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  /** Creative full-screen background gradient. */
  bgGradient: [string, string, string, string];
  /** Floating decorative emoji that drift in the background. */
  decor: string[];
  /** The visual the child reaches toward. */
  targetEmoji: string;
  /** For twoStage: the object to pick up before placing. */
  sourceEmoji?: string;
  kind: TargetKind;
  rounds: number;
  /** Reach/move anchors cycled per round (hand · body · bothHands). */
  anchors: Anchor[];
  /** Pickup → place anchor pairs for twoStage games. */
  pairs?: [Anchor, Anchor][];
  collectible: string;
  hintText: string;
  positionCue: string;
  planText: string;
  goText: string;
  voiceIntro: string;
  voicePlan: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const MOTOR_GAME_THEMES: Record<MotorMode, MotorGameTheme> = {
  touchTarget: {
    title: 'Touch The Target',
    subtitle: 'Plan your reach, then touch each glowing target!',
    emoji: '🎯',
    hero: '🖐️',
    accent: '#F472B6',
    accentDeep: '#BE185D',
    glow: 'rgba(244,114,182,0.55)',
    bgGradient: ['#1E1B4B', '#312E81', '#7C3AED', '#F472B6'],
    decor: ['🎯', '✨', '🟣', '💫', '🎯', '⭐'],
    targetEmoji: '🎯',
    kind: 'hand',
    rounds: 6,
    anchors: [
      { x: 0.5, y: 0.32 },
      { x: 0.78, y: 0.42 },
      { x: 0.22, y: 0.42 },
      { x: 0.66, y: 0.22 },
      { x: 0.34, y: 0.22 },
      { x: 0.5, y: 0.5 },
    ],
    collectible: '🏅',
    hintText: 'Reach a hand to the glowing target and hold it!',
    positionCue: 'Stand back so the camera sees your arms — ready to reach!',
    planText: 'Plan your move…',
    goText: 'Reach now!',
    voiceIntro: 'Welcome to the Target Lab! Plan your move, then reach out and touch each glowing target.',
    voicePlan: 'Get ready… plan where you will reach.',
    voiceComplete: 'Amazing! You touched every target with a great plan!',
    congrats: 'Target Touch Champion!',
    skillTags: ['praxis', 'motor-planning', 'reach-accuracy', 'body-awareness', 'sequencing'],
  },
  reachStar: {
    title: 'Reach The Star',
    subtitle: 'Stretch up high and grab each twinkling star!',
    emoji: '⭐',
    hero: '🌟',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.55)',
    bgGradient: ['#0F172A', '#1E1B4B', '#4338CA', '#0EA5E9'],
    decor: ['⭐', '🌟', '✨', '🌙', '💫', '⭐'],
    targetEmoji: '⭐',
    kind: 'hand',
    rounds: 6,
    anchors: [
      { x: 0.5, y: 0.13 },
      { x: 0.24, y: 0.2 },
      { x: 0.76, y: 0.2 },
      { x: 0.38, y: 0.11 },
      { x: 0.62, y: 0.11 },
      { x: 0.5, y: 0.24 },
    ],
    collectible: '🌟',
    hintText: 'Stretch a hand up high to the star and hold it!',
    positionCue: 'Stand tall with room above you — get ready to reach up!',
    planText: 'Spot the star…',
    goText: 'Reach up!',
    voiceIntro: 'The sky is full of stars! Plan your reach, then stretch up high to grab each one.',
    voicePlan: 'Look up and plan your big stretch.',
    voiceComplete: 'Wonderful! You reached every star in the sky!',
    congrats: 'Star Reacher Hero!',
    skillTags: ['praxis', 'motor-planning', 'overhead-reach', 'body-awareness', 'sequencing'],
  },
  moveToSpot: {
    title: 'Move To The Spot',
    subtitle: 'Plan your steps and move your body onto each glowing spot!',
    emoji: '👣',
    hero: '🧍',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.55)',
    bgGradient: ['#052E2B', '#064E3B', '#0D9488', '#22D3EE'],
    decor: ['👣', '🟢', '✨', '🌿', '👣', '💚'],
    targetEmoji: '🟢',
    kind: 'body',
    rounds: 6,
    anchors: [
      { x: 0.26, y: 0.58 },
      { x: 0.74, y: 0.58 },
      { x: 0.5, y: 0.6 },
      { x: 0.34, y: 0.5 },
      { x: 0.66, y: 0.5 },
      { x: 0.5, y: 0.48 },
    ],
    collectible: '✅',
    hintText: 'Step and lean so your body lands on the glowing spot!',
    positionCue: 'Stand where the camera sees you — leave room to step side to side!',
    planText: 'Pick your path…',
    goText: 'Move now!',
    voiceIntro: 'Time to move! Plan your steps, then shift your whole body onto each glowing spot.',
    voicePlan: 'Look at the spot and plan your steps.',
    voiceComplete: 'Brilliant moving! You landed on every spot!',
    congrats: 'Spot Mover Champion!',
    skillTags: ['praxis', 'motor-planning', 'weight-shift', 'body-awareness', 'spatial-planning'],
  },
  launchRocket: {
    title: 'Launch The Rocket',
    subtitle: 'Raise BOTH arms up high to blast the rocket into space!',
    emoji: '🚀',
    hero: '🙌',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.55)',
    bgGradient: ['#020617', '#0F172A', '#1D4ED8', '#7C3AED'],
    decor: ['🚀', '🪐', '⭐', '🛰️', '✨', '🌑'],
    targetEmoji: '🚀',
    kind: 'bothHands',
    rounds: 5,
    anchors: [
      { x: 0.5, y: 0.16 },
      { x: 0.5, y: 0.15 },
      { x: 0.5, y: 0.14 },
      { x: 0.5, y: 0.13 },
      { x: 0.5, y: 0.12 },
    ],
    collectible: '⚡',
    hintText: 'Raise BOTH hands up high together to launch!',
    positionCue: 'Stand tall with space above your head — ready to launch!',
    planText: 'Get set…',
    goText: 'Arms up — launch!',
    voiceIntro: 'Mission control! Plan your launch, then raise both arms up high to blast the rocket into space!',
    voicePlan: 'Get ready to lift both arms together.',
    voiceComplete: 'Blast off! You launched every rocket into space!',
    congrats: 'Rocket Launch Commander!',
    skillTags: ['praxis', 'motor-planning', 'bilateral-coordination', 'overhead-reach', 'sequencing'],
  },
  placeBox: {
    title: 'Place The Box',
    subtitle: 'Pick up the box, then carry your reach over to the shelf!',
    emoji: '📦',
    hero: '🤲',
    accent: '#FB923C',
    accentDeep: '#C2410C',
    glow: 'rgba(251,146,60,0.55)',
    bgGradient: ['#1C1917', '#451A03', '#B45309', '#F59E0B'],
    decor: ['📦', '🧱', '✨', '🪵', '📦', '🟧'],
    targetEmoji: '📥',
    sourceEmoji: '📦',
    kind: 'twoStage',
    rounds: 5,
    anchors: [],
    pairs: [
      [{ x: 0.22, y: 0.52 }, { x: 0.8, y: 0.26 }],
      [{ x: 0.78, y: 0.52 }, { x: 0.2, y: 0.26 }],
      [{ x: 0.3, y: 0.58 }, { x: 0.7, y: 0.2 }],
      [{ x: 0.7, y: 0.58 }, { x: 0.3, y: 0.2 }],
      [{ x: 0.25, y: 0.5 }, { x: 0.75, y: 0.3 }],
    ],
    collectible: '📦',
    hintText: 'Reach the box to grab it, then reach the shelf to place it!',
    positionCue: 'Stand back so the camera sees both arms — ready to carry!',
    planText: 'Plan: grab then place…',
    goText: 'Grab the box!',
    voiceIntro: 'Help in the warehouse! Plan your move — reach to grab the box, then reach over to place it on the shelf.',
    voicePlan: 'Plan two steps: first grab, then place.',
    voiceComplete: 'Great work! Every box is safely on the shelf!',
    congrats: 'Box Mover Champion!',
    skillTags: ['praxis', 'motor-planning', 'sequencing', 'reach-accuracy', 'bilateral-coordination'],
  },
};
