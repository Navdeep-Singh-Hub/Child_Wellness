/**
 * OT Level 8 · Session 2 — "Two-Step Motor Planning" (Praxis Lab II)
 *
 * Five camera-tracked movement-adventure games. The child PLANS a TWO-STEP
 * sequence and then EXECUTES both actions in the correct order — e.g. clap THEN
 * jump, touch THEN turn. Pose tracking scores reach/gesture accuracy, sequence
 * completion and movement quality (smooth, ordered praxis).
 *
 * Bright "circus / mission control" palette so it reads apart from Session 1.
 */

export type Anchor = { x: number; y: number };

/** A single movement primitive the child must perform. */
export type ActionKind =
  | 'reach' // reach a hand to a target anchor
  | 'touch' // reach/touch a target anchor (same detection as reach)
  | 'pick' // reach to a source anchor (grab)
  | 'place' // reach to a destination anchor (release)
  | 'clap' // bring both hands together at chest
  | 'jump' // push the whole body up
  | 'turn' // rotate the body sideways
  | 'freeze' // hold completely still
  | 'launch' // raise both hands up high
  | 'catch'; // bring both hands together down at chest (after launch)

export type Step = {
  kind: ActionKind;
  /** Short instruction label, e.g. "Clap". */
  label: string;
  icon: string;
  /** True when the step needs an on-screen target anchor. */
  targeted: boolean;
};

export type TwoStepMode =
  | 'clapThenJump'
  | 'touchThenTurn'
  | 'reachThenFreeze'
  | 'launchThenCatch'
  | 'pickAndPlace';

export const TWO_STEP_SHELL = {
  backText: '#FBCFE8',
  backBorder: 'rgba(251,207,232,0.4)',
  statLabel: '#FDA4AF',
  statValue: '#FFE4E6',
  statBorder: 'rgba(253,164,175,0.4)',
  sparkleColor: '#FEF08A',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
} as const;

export type TwoStepGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  step1: Step;
  step2: Step;
  rounds: number;
  /** Anchors for a single targeted step (cycled per round). */
  anchors?: Anchor[];
  /** Pick → place anchor pairs when BOTH steps are targeted. */
  pairs?: [Anchor, Anchor][];
  collectible: string;
  hintText: string;
  positionCue: string;
  voiceIntro: string;
  voicePlan: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const TWO_STEP_GAME_THEMES: Record<TwoStepMode, TwoStepGameTheme> = {
  clapThenJump: {
    title: 'Clap Then Jump',
    subtitle: 'Plan it out — first CLAP your hands, then JUMP up high!',
    emoji: '👏',
    hero: '🤸',
    accent: '#F472B6',
    accentDeep: '#BE185D',
    glow: 'rgba(244,114,182,0.55)',
    bgGradient: ['#2E1065', '#6D28D9', '#DB2777', '#FB7185'],
    decor: ['👏', '🦘', '✨', '🎉', '👏', '⭐'],
    step1: { kind: 'clap', label: 'Clap', icon: '👏', targeted: false },
    step2: { kind: 'jump', label: 'Jump', icon: '🦘', targeted: false },
    rounds: 6,
    collectible: '🎉',
    hintText: 'First clap your hands together, then jump up high!',
    positionCue: 'Stand back so the camera sees your whole body — room to jump!',
    voiceIntro: 'Welcome to the action stage! Plan your move — first clap your hands, then jump up high!',
    voicePlan: 'Remember the order: clap first, then jump.',
    voiceComplete: 'Fantastic! You clapped and jumped every time!',
    congrats: 'Clap & Jump Champion!',
    skillTags: ['praxis', 'sequencing', 'motor-planning', 'bilateral-coordination', 'body-awareness'],
  },
  touchThenTurn: {
    title: 'Touch Then Turn',
    subtitle: 'Plan two moves — TOUCH the target, then TURN your body!',
    emoji: '🎯',
    hero: '🌀',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.55)',
    bgGradient: ['#082F49', '#0E7490', '#2563EB', '#22D3EE'],
    decor: ['🎯', '🌀', '✨', '🧭', '🎯', '💫'],
    step1: { kind: 'touch', label: 'Touch', icon: '🎯', targeted: true },
    step2: { kind: 'turn', label: 'Turn', icon: '🌀', targeted: false },
    rounds: 6,
    anchors: [
      { x: 0.5, y: 0.3 },
      { x: 0.76, y: 0.4 },
      { x: 0.24, y: 0.4 },
      { x: 0.66, y: 0.24 },
      { x: 0.34, y: 0.24 },
      { x: 0.5, y: 0.46 },
    ],
    collectible: '🏅',
    hintText: 'First touch the glowing target, then turn your body sideways!',
    positionCue: 'Stand back so the camera sees your arms — room to turn around!',
    voiceIntro: 'Two moves to plan! First reach out and touch the target, then turn your body sideways!',
    voicePlan: 'Order matters: touch first, then turn.',
    voiceComplete: 'Brilliant! You touched and turned like a pro!',
    congrats: 'Touch & Turn Hero!',
    skillTags: ['praxis', 'sequencing', 'motor-planning', 'body-rotation', 'body-awareness'],
  },
  reachThenFreeze: {
    title: 'Reach Then Freeze',
    subtitle: 'Plan it — REACH up to the star, then FREEZE like a statue!',
    emoji: '⭐',
    hero: '🗿',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.55)',
    bgGradient: ['#1E1B4B', '#4338CA', '#7C3AED', '#FACC15'],
    decor: ['⭐', '🗿', '✨', '❄️', '⭐', '💫'],
    step1: { kind: 'reach', label: 'Reach', icon: '⭐', targeted: true },
    step2: { kind: 'freeze', label: 'Freeze', icon: '🧊', targeted: false },
    rounds: 6,
    anchors: [
      { x: 0.5, y: 0.14 },
      { x: 0.26, y: 0.2 },
      { x: 0.74, y: 0.2 },
      { x: 0.4, y: 0.12 },
      { x: 0.6, y: 0.12 },
      { x: 0.5, y: 0.24 },
    ],
    collectible: '🌟',
    hintText: 'First reach up to the star, then freeze perfectly still!',
    positionCue: 'Stand tall with room above you — get ready to reach and freeze!',
    voiceIntro: 'Plan two steps! First stretch up and reach the star, then freeze like a statue!',
    voicePlan: 'Reach first, then hold your freeze.',
    voiceComplete: 'Amazing control! You reached and froze every time!',
    congrats: 'Reach & Freeze Master!',
    skillTags: ['praxis', 'sequencing', 'motor-planning', 'postural-control', 'self-regulation'],
  },
  launchThenCatch: {
    title: 'Launch Then Catch',
    subtitle: 'Plan it — LAUNCH with both arms up, then CATCH it at your chest!',
    emoji: '🚀',
    hero: '🧤',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.55)',
    bgGradient: ['#020617', '#0F766E', '#1D4ED8', '#22D3EE'],
    decor: ['🚀', '🧤', '⭐', '🛰️', '✨', '🪐'],
    step1: { kind: 'launch', label: 'Launch', icon: '🙌', targeted: false },
    step2: { kind: 'catch', label: 'Catch', icon: '🧤', targeted: false },
    rounds: 5,
    collectible: '⚡',
    hintText: 'First raise both arms up to launch, then bring hands together to catch!',
    positionCue: 'Stand tall with space above your head — ready to launch and catch!',
    voiceIntro: 'Mission ready! Plan it — raise both arms up to launch, then bring your hands together to catch!',
    voicePlan: 'Launch first with arms up, then catch at your chest.',
    voiceComplete: 'Great catch! You launched and caught every time!',
    congrats: 'Launch & Catch Commander!',
    skillTags: ['praxis', 'sequencing', 'motor-planning', 'bilateral-coordination', 'timing'],
  },
  pickAndPlace: {
    title: 'Pick And Place',
    subtitle: 'Plan two reaches — PICK up the box, then PLACE it on the shelf!',
    emoji: '📦',
    hero: '🤲',
    accent: '#FB923C',
    accentDeep: '#C2410C',
    glow: 'rgba(251,146,60,0.55)',
    bgGradient: ['#1C1917', '#7C2D12', '#B45309', '#FBBF24'],
    decor: ['📦', '🧱', '✨', '🪵', '📦', '🟧'],
    step1: { kind: 'pick', label: 'Pick', icon: '📦', targeted: true },
    step2: { kind: 'place', label: 'Place', icon: '📥', targeted: true },
    rounds: 5,
    pairs: [
      [{ x: 0.22, y: 0.52 }, { x: 0.8, y: 0.26 }],
      [{ x: 0.78, y: 0.52 }, { x: 0.2, y: 0.26 }],
      [{ x: 0.3, y: 0.58 }, { x: 0.7, y: 0.2 }],
      [{ x: 0.7, y: 0.58 }, { x: 0.3, y: 0.2 }],
      [{ x: 0.25, y: 0.5 }, { x: 0.75, y: 0.3 }],
    ],
    collectible: '📦',
    hintText: 'First reach the box to pick it up, then reach the shelf to place it!',
    positionCue: 'Stand back so the camera sees both arms — ready to carry!',
    voiceIntro: 'Warehouse time! Plan two reaches — first pick up the box, then place it on the shelf!',
    voicePlan: 'Two reaches: pick up first, then place.',
    voiceComplete: 'Great work! Every box is picked and placed!',
    congrats: 'Pick & Place Champion!',
    skillTags: ['praxis', 'sequencing', 'motor-planning', 'reach-accuracy', 'bilateral-coordination'],
  },
};
