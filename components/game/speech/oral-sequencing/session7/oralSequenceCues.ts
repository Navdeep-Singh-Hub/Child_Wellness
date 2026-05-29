export type OralSequenceCue = {
  label: string;
  emoji: string;
  steps: string[];
};

export const MAGIC_SEQUENCE_CUES: OralSequenceCue[] = [
  { label: 'OPEN → SMILE → CLOSE', emoji: '✨', steps: ['Open', 'Smile', 'Close'] },
  { label: 'ROUND → OPEN → CLOSE', emoji: '😮', steps: ['Round', 'Open', 'Close'] },
  { label: 'OPEN → TONGUE_VISIBLE → CLOSE', emoji: '👅', steps: ['Open', 'Tongue', 'Close'] },
];

export const MONSTER_SEQUENCE_CUES: OralSequenceCue[] = [
  { label: 'OPEN → ROUND', emoji: '👾', steps: ['Open', 'Round'] },
  { label: 'OPEN → TONGUE_OUT → CLOSE', emoji: '😜', steps: ['Open', 'Tongue', 'Close'] },
  { label: 'SMILE → OPEN → CLOSE', emoji: '😁', steps: ['Smile', 'Open', 'Close'] },
];

export const ROBOT_SEQUENCE_CUES: OralSequenceCue[] = [
  { label: 'OPEN → CLOSE', emoji: '🤖', steps: ['Open', 'Close'] },
  { label: 'ROUND → OPEN', emoji: '😮', steps: ['Round', 'Open'] },
  { label: 'OPEN → SMILE → CLOSE', emoji: '🙂', steps: ['Open', 'Smile', 'Close'] },
];

export const RHYTHM_SEQUENCE_CUES: OralSequenceCue[] = [
  { label: 'MOVE → PAUSE → MOVE', emoji: '🥁', steps: ['Move', 'Pause', 'Move'] },
  { label: 'OPEN → PAUSE → CLOSE', emoji: '⏸️', steps: ['Open', 'Pause', 'Close'] },
];

export const HERO_SEQUENCE_CUES: OralSequenceCue[] = [
  { label: 'WATCH → COPY → REPEAT', emoji: '🦸', steps: ['Watch', 'Copy', 'Repeat'] },
  { label: 'JAW + LIPS + TONGUE + AIR', emoji: '👄', steps: ['Jaw', 'Lips', 'Tongue', 'Air'] },
];
