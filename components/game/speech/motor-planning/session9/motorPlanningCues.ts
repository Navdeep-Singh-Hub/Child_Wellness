export type PlanningCue = {
  label: string;
  emoji: string;
  steps: string[];
};

export const MAGIC_PLANNER_CUES: PlanningCue[] = [
  { label: 'WATCH → PREPARE → COPY', emoji: '✨', steps: ['Watch', 'Prepare', 'Copy'] },
  { label: 'OPEN → ROUND → CLOSE', emoji: '😮', steps: ['Open', 'Round', 'Close'] },
  { label: 'SMILE → OPEN → CLOSE', emoji: '😊', steps: ['Smile', 'Open', 'Close'] },
];

export const MONSTER_MISSION_CUES: PlanningCue[] = [
  { label: 'OPEN → TONGUE_OUT', emoji: '👾', steps: ['Open', 'Tongue'] },
  { label: 'ROUND → SMILE', emoji: '😜', steps: ['Round', 'Smile'] },
  { label: 'OPEN → BLOW → CLOSE', emoji: '💨', steps: ['Open', 'Air', 'Close'] },
];

export const ROBOT_COPY_CUES: PlanningCue[] = [
  { label: 'OPEN → CLOSE', emoji: '🤖', steps: ['Open', 'Close'] },
  { label: 'ROUND → OPEN', emoji: '😮', steps: ['Round', 'Open'] },
  { label: 'OPEN → SMILE → CLOSE', emoji: '🙂', steps: ['Open', 'Smile', 'Close'] },
];

export const PATH_ADVENTURE_CUES: PlanningCue[] = [
  { label: 'movement → pause → movement', emoji: '🥁', steps: ['Move', 'Pause', 'Move'] },
];

export const HERO_PLANNING_CUES: PlanningCue[] = [
  { label: 'WATCH → PREPARE → COPY', emoji: '🦸', steps: ['Watch', 'Prepare', 'Copy'] },
  { label: 'timing + jaw + lips + tongue + air', emoji: '🧠', steps: ['Timing', 'Jaw', 'Lips', 'Tongue', 'Air'] },
];
