/**
 * OT Level 10 · Session 1 · Game 5 — Sensory Detective · "Noir Evidence Bureau"
 *
 * Slate navy + copper lamp + moss detective green — distinct from Games 1–4.
 */

export const DETECTIVE_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.35)',
  statLabel: '#86EFAC',
  statValue: '#FFFBEB',
  statBorder: 'rgba(134,239,172,0.4)',
  stageBorder: 'rgba(217,119,6,0.5)',
  stageBg: 'rgba(15,23,42,0.72)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  sparkleColor: '#FDE68A',
  glassBorder: 'rgba(251,191,36,0.3)',
  academyLabel: 'SENSORY INVESTIGATION UNIT',
  cork: '#92400E',
  paper: '#FEF3C7',
} as const;

export type EvidenceClueId = 'a' | 'b' | 'c';

export type EvidenceClue = {
  id: EvidenceClueId;
  emoji: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  pinColor: string;
};

export type DetectiveCase = {
  id: string;
  caseNumber: number;
  trait: string;
  traitEmoji: string;
  caseTitle: string;
  voiceCue: string;
  seekCue: string;
  wrongCue: string;
  /** Play sound during briefing (auditory integration). */
  soundKey?: 'bell' | 'drum' | 'beep' | 'splash' | 'clap';
  soundRate?: number;
  /** Requires magnifier scan before clues unlock. */
  needsScan: boolean;
  correctClueId: EvidenceClueId;
  clues: [EvidenceClue, EvidenceClue, EvidenceClue];
};

export const SENSORY_DETECTIVE_THEME = {
  title: 'Sensory Detective',
  subtitle: 'Read each case file, investigate the clues, and solve the sensory mystery with your body!',
  emoji: '🕵️',
  hero: '🔍',
  accent: '#22C55E',
  accentCopper: '#D97706',
  accentSlate: '#64748B',
  glow: 'rgba(34,197,94,0.5)',
  bgGradient: ['#0F172A', '#1E293B', '#422006', '#14532D'] as [string, string, string, string],
  decor: ['🔍', '📎', '📁', '🕵️', '💡', '🧩', '✨', '📋'],
  hintText: 'Move your explorer dot to the matching evidence clue and hold to solve the case.',
  positionCue: 'Face the camera so we can track your movement and attention.',
  briefingLabel: 'CASE FILE',
  scanLabel: 'SCAN CLUE',
  solveLabel: 'SOLVE IT!',
  voiceIntro:
    'Welcome Detective! Each case needs your sharp senses. Read the clue, investigate the evidence board, and solve every mystery.',
  voiceComplete: 'Case closed! You solved every sensory mystery like a true detective!',
  congrats: 'Master Detective!',
  skillTags: [
    'problem-solving',
    'sensory-integration',
    'adaptive-responses',
    'attention',
    'motor-planning',
  ],
} as const;

/** Magnifier scan station — unlocks evidence on advanced rounds. */
export const MAGNIFIER_STATION = {
  x: 0.5,
  y: 0.82,
  radius: 0.09,
  emoji: '🔍',
  label: 'Scan Here',
} as const;

export const DETECTIVE_CASES: DetectiveCase[] = [
  {
    id: 'bright-case',
    caseNumber: 1,
    trait: 'BRIGHT',
    traitEmoji: '☀️',
    caseTitle: 'The Glowing Light',
    voiceCue: 'Case one: find the BRIGHT clue on the evidence board!',
    seekCue: 'Move to the brightest evidence!',
    wrongCue: 'That clue is not bright — keep investigating!',
    needsScan: false,
    correctClueId: 'a',
    clues: [
      { id: 'a', emoji: '☀️', label: 'Sunbeam', x: 0.22, y: 0.38, radius: 0.1, pinColor: '#FBBF24' },
      { id: 'b', emoji: '🌙', label: 'Moonlit', x: 0.5, y: 0.42, radius: 0.1, pinColor: '#94A3B8' },
      { id: 'c', emoji: '🌧️', label: 'Rainy', x: 0.78, y: 0.38, radius: 0.1, pinColor: '#60A5FA' },
    ],
  },
  {
    id: 'loud-case',
    caseNumber: 2,
    trait: 'LOUD',
    traitEmoji: '🔊',
    caseTitle: 'The Booming Echo',
    voiceCue: 'Case two: listen! Find the LOUD clue!',
    seekCue: 'Seek the loudest evidence!',
    wrongCue: 'Too quiet — find the loud clue!',
    soundKey: 'drum',
    soundRate: 1.05,
    needsScan: false,
    correctClueId: 'b',
    clues: [
      { id: 'a', emoji: '🔇', label: 'Silent', x: 0.24, y: 0.55, radius: 0.1, pinColor: '#94A3B8' },
      { id: 'b', emoji: '🔊', label: 'Booming', x: 0.5, y: 0.35, radius: 0.1, pinColor: '#F97316' },
      { id: 'c', emoji: '🎵', label: 'Gentle', x: 0.76, y: 0.55, radius: 0.1, pinColor: '#A78BFA' },
    ],
  },
  {
    id: 'soft-case',
    caseNumber: 3,
    trait: 'SOFT',
    traitEmoji: '🪶',
    caseTitle: 'The Gentle Touch',
    voiceCue: 'Case three: find the SOFT tactile clue!',
    seekCue: 'Find the softest evidence!',
    wrongCue: 'That feels rough — try another clue!',
    needsScan: false,
    correctClueId: 'c',
    clues: [
      { id: 'a', emoji: '🔨', label: 'Hard', x: 0.22, y: 0.48, radius: 0.1, pinColor: '#78716C' },
      { id: 'b', emoji: '🌵', label: 'Prickly', x: 0.5, y: 0.62, radius: 0.1, pinColor: '#22C55E' },
      { id: 'c', emoji: '🪶', label: 'Feather', x: 0.78, y: 0.48, radius: 0.1, pinColor: '#E9D5FF' },
    ],
  },
  {
    id: 'sweet-case',
    caseNumber: 4,
    trait: 'SWEET',
    traitEmoji: '🍯',
    caseTitle: 'The Honey Trail',
    voiceCue: 'Case four: sniff out the SWEET clue!',
    seekCue: 'Move to the sweetest evidence!',
    wrongCue: 'Not sweet enough — keep sleuthing!',
    needsScan: true,
    correctClueId: 'a',
    clues: [
      { id: 'a', emoji: '🍯', label: 'Honey', x: 0.28, y: 0.4, radius: 0.1, pinColor: '#FBBF24' },
      { id: 'b', emoji: '🧄', label: 'Sharp', x: 0.5, y: 0.52, radius: 0.1, pinColor: '#F5F5F4' },
      { id: 'c', emoji: '🍋', label: 'Sour', x: 0.72, y: 0.4, radius: 0.1, pinColor: '#FDE047' },
    ],
  },
  {
    id: 'bouncy-case',
    caseNumber: 5,
    trait: 'BOUNCY',
    traitEmoji: '🦘',
    caseTitle: 'The Jumping Lead',
    voiceCue: 'Final case! Scan the magnifier, then find the BOUNCY clue!',
    seekCue: 'Find the bounciest evidence!',
    wrongCue: 'Too still — find the bouncy clue!',
    needsScan: true,
    correctClueId: 'b',
    clues: [
      { id: 'a', emoji: '🧊', label: 'Frozen', x: 0.22, y: 0.44, radius: 0.095, pinColor: '#67E8F9' },
      { id: 'b', emoji: '🦘', label: 'Bouncy', x: 0.5, y: 0.36, radius: 0.095, pinColor: '#F97316' },
      { id: 'c', emoji: '🪨', label: 'Heavy', x: 0.78, y: 0.44, radius: 0.095, pinColor: '#78716C' },
    ],
  },
];
