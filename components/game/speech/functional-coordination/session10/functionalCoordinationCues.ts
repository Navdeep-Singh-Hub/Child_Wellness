export type CoordinationCue = {
  label: string;
  emoji: string;
  steps: string[];
};

export const MAGIC_TEAMWORK_CUES: CoordinationCue[] = [
  { label: 'OPEN → ROUND → BLOW', emoji: '✨', steps: ['Open', 'Round', 'Blow'] },
  { label: 'SMILE → OPEN → CLOSE', emoji: '😊', steps: ['Smile', 'Open', 'Close'] },
  { label: 'TONGUE_OUT → CLOSE', emoji: '👅', steps: ['Tongue', 'Close'] },
];

export const FUNNY_MONSTER_CUES: CoordinationCue[] = [
  { label: 'OPEN → TONGUE_OUT → CLOSE', emoji: '👾', steps: ['Open', 'Tongue', 'Close'] },
  { label: 'ROUND → OPEN → BLOW', emoji: '💨', steps: ['Round', 'Open', 'Air'] },
  { label: 'SMILE → OPEN → PAUSE', emoji: '😄', steps: ['Smile', 'Open', 'Pause'] },
];

export const ROBOT_ADVENTURE_CUES: CoordinationCue[] = [
  { label: 'WATCH → PREPARE → COPY', emoji: '🤖', steps: ['Watch', 'Prepare', 'Copy'] },
  { label: 'OPEN → ROUND → CLOSE', emoji: '😮', steps: ['Open', 'Round', 'Close'] },
  { label: 'OPEN → BLOW → STOP', emoji: '🛑', steps: ['Open', 'Air', 'Stop'] },
];

export const RHYTHM_QUEST_CUES: CoordinationCue[] = [
  { label: 'movement → pause → movement', emoji: '🥁', steps: ['Move', 'Pause', 'Move'] },
];

export const HERO_GRADUATION_CUES: CoordinationCue[] = [
  { label: 'watch → prepare → copy → repeat', emoji: '🎓', steps: ['Watch', 'Prepare', 'Copy', 'Repeat'] },
  { label: 'jaw + lips + tongue + airflow + timing', emoji: '🦸', steps: ['Jaw', 'Lips', 'Tongue', 'Air', 'Timing'] },
];
