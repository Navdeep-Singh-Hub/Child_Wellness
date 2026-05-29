export type TimingCue = {
  label: string;
  emoji: string;
  steps: string[];
};

export const MAGIC_BEAT_CUES: TimingCue[] = [
  { label: 'OPEN → pause → CLOSE', emoji: '✨', steps: ['Open', 'Pause', 'Close'] },
  { label: 'ROUND → hold → SMILE', emoji: '😮', steps: ['Round', 'Hold', 'Smile'] },
];

export const MONSTER_TIMING_CUES: TimingCue[] = [
  { label: 'MOVE → STOP', emoji: '👾', steps: ['Move', 'Stop'] },
  { label: 'OPEN → PAUSE → CLOSE', emoji: '😜', steps: ['Open', 'Pause', 'Close'] },
  { label: 'ROUND → HOLD', emoji: '😁', steps: ['Round', 'Hold'] },
];

export const ROBOT_PAUSE_CUES: TimingCue[] = [
  { label: 'GO → STOP → GO', emoji: '🤖', steps: ['Go', 'Stop', 'Go'] },
  { label: 'OPEN → CLOSE → OPEN', emoji: '🙂', steps: ['Open', 'Close', 'Open'] },
];

export const RHYTHM_ROAD_CUES: TimingCue[] = [
  { label: 'movement → pause → movement', emoji: '🥁', steps: ['Move', 'Pause', 'Move'] },
];

export const HERO_TIMING_CUES: TimingCue[] = [
  { label: 'WATCH → COPY → REPEAT', emoji: '🦸', steps: ['Watch', 'Copy', 'Repeat'] },
  { label: 'timing + order + airflow', emoji: '⏱️', steps: ['Timing', 'Order', 'Air'] },
];
