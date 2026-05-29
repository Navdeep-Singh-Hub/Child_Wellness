export type MultiStepCue = {
  label: string;
  emoji: string;
  steps: string[];
};

export const MAGIC_STEPS: MultiStepCue[] = [
  { label: 'OPEN → SMILE', emoji: '😊', steps: ['Open mouth', 'Smile lips'] },
  { label: 'ROUND → OPEN', emoji: '😮', steps: ['Round lips', 'Open mouth'] },
  { label: 'OPEN → CLOSE', emoji: '🙂', steps: ['Open mouth', 'Close mouth'] },
];

export const MONSTER_STEPS: MultiStepCue[] = [
  { label: 'OPEN → TONGUE_OUT', emoji: '👾', steps: ['Open mouth', 'Tongue visible'] },
  { label: 'ROUND → SMILE', emoji: '😜', steps: ['Round lips', 'Smile lips'] },
  { label: 'OPEN → BLOW', emoji: '💨', steps: ['Open mouth', 'Soft airflow'] },
];

export const ROBOT_STEPS: MultiStepCue[] = [
  { label: 'OPEN → CLOSE', emoji: '🤖', steps: ['Open mouth', 'Close mouth'] },
  { label: 'OPEN → ROUND', emoji: '😮', steps: ['Open mouth', 'Round lips'] },
  { label: 'OPEN → TONGUE_VISIBLE', emoji: '👅', steps: ['Open mouth', 'Tongue visible'] },
];

export const RHYTHM_STEPS: MultiStepCue[] = [
  { label: 'MOVE → PAUSE → MOVE', emoji: '🥁', steps: ['Move', 'Pause', 'Move'] },
  { label: 'OPEN → PAUSE → CLOSE', emoji: '🙂', steps: ['Open', 'Pause', 'Close'] },
];

export const HERO_STEPS: MultiStepCue[] = [
  { label: 'WATCH → COPY → REPEAT', emoji: '🦸', steps: ['Watch', 'Copy', 'Repeat'] },
  { label: 'JAW + LIPS + TONGUE', emoji: '👄', steps: ['Jaw', 'Lips', 'Tongue'] },
];
