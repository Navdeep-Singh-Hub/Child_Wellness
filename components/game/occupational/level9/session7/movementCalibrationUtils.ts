/**
 * OT Level 9 · Session 7 — Movement Calibration pose math.
 * Ultra-slow trajectory progress + controlled calibration effort.
 */
import {
  uprightScore,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import {
  forwardPressScore,
  squeezeScore,
  type ForceBaseline,
} from '@/components/game/occupational/level9/session1/forceUtils';
import {
  matchFullBodyPose,
  type FullBodyPoseTarget,
  type FullBodyReadout,
} from '@/components/game/occupational/level9/session3/jointUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type CalibrationZoneStatus = 'light' | 'zone' | 'heavy';

export function calibrationZoneStatus(power: number, target: number, bandHalf: number): CalibrationZoneStatus {
  if (power < target - bandHalf) return 'light';
  if (power > target + bandHalf) return 'heavy';
  return 'zone';
}

export type SlowMotionRound = {
  id: string;
  name: string;
  icon: string;
  label: string;
  /** Neutral rest pose at path start. */
  start: FullBodyPoseTarget;
  /** Calibration target at path end. */
  end: FullBodyPoseTarget;
};

/** Eight glacial slow-motion calibration paths. */
export const SLOW_MOTION_ROUNDS: SlowMotionRound[] = [
  {
    id: 'arm-rise',
    name: 'Glacial Arm Rise',
    icon: '🙋',
    label: 'ARM RISE',
    start: {
      id: 'arm-rise-start',
      name: 'Rest',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'arm-rise-end',
      name: 'Glacial Arm Rise',
      icon: '🙋',
      leftRaise: 0.78,
      rightRaise: 0.78,
      leftElbow: 0.22,
      rightElbow: 0.22,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'forward-reach',
    name: 'Slow Forward Reach',
    icon: '🤲',
    label: 'REACH',
    start: {
      id: 'reach-start',
      name: 'Rest',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'reach-end',
      name: 'Slow Forward Reach',
      icon: '🤲',
      leftRaise: 0.52,
      rightRaise: 0.52,
      leftElbow: 0.68,
      rightElbow: 0.68,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.16,
      rightKnee: 0.16,
    },
  },
  {
    id: 'gentle-squat',
    name: 'Gentle Squat',
    icon: '⬇️',
    label: 'SQUAT',
    start: {
      id: 'squat-start',
      name: 'Stand',
      icon: '🧍',
      leftRaise: 0.14,
      rightRaise: 0.14,
      leftElbow: 0.16,
      rightElbow: 0.16,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'squat-end',
      name: 'Gentle Squat',
      icon: '⬇️',
      leftRaise: 0.38,
      rightRaise: 0.38,
      leftElbow: 0.42,
      rightElbow: 0.42,
      leftLift: 0.18,
      rightLift: 0.18,
      leftKnee: 0.74,
      rightKnee: 0.74,
    },
  },
  {
    id: 'side-reach',
    name: 'Slow Side Reach',
    icon: '🙌',
    label: 'SIDE REACH',
    start: {
      id: 'side-start',
      name: 'Rest',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'side-end',
      name: 'Slow Side Reach',
      icon: '🙌',
      leftRaise: 0.84,
      rightRaise: 0.28,
      leftElbow: 0.32,
      rightElbow: 0.3,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'knee-lift',
    name: 'Slow Knee Lift',
    icon: '🦵',
    label: 'KNEE LIFT',
    start: {
      id: 'knee-start',
      name: 'Stand',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'knee-end',
      name: 'Slow Knee Lift',
      icon: '🦵',
      leftRaise: 0.32,
      rightRaise: 0.32,
      leftElbow: 0.28,
      rightElbow: 0.28,
      leftLift: 0.56,
      rightLift: 0.1,
      leftKnee: 0.42,
      rightKnee: 0.12,
    },
  },
  {
    id: 'slow-bow',
    name: 'Slow Bow',
    icon: '🙇',
    label: 'BOW',
    start: {
      id: 'bow-start',
      name: 'Stand',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'bow-end',
      name: 'Slow Bow',
      icon: '🙇',
      leftRaise: 0.18,
      rightRaise: 0.18,
      leftElbow: 0.48,
      rightElbow: 0.48,
      leftLift: 0.12,
      rightLift: 0.12,
      leftKnee: 0.32,
      rightKnee: 0.32,
    },
  },
  {
    id: 'wind-spread',
    name: 'Slow Wind Spread',
    icon: '🪽',
    label: 'SPREAD',
    start: {
      id: 'spread-start',
      name: 'Rest',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'spread-end',
      name: 'Slow Wind Spread',
      icon: '🪽',
      leftRaise: 0.9,
      rightRaise: 0.9,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'full-calibrate',
    name: 'Full Slow Calibrate',
    icon: '🌟',
    label: 'FULL PATH',
    start: {
      id: 'full-start',
      name: 'Rest',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'full-end',
      name: 'Full Slow Calibrate',
      icon: '🌟',
      leftRaise: 0.86,
      rightRaise: 0.86,
      leftElbow: 0.3,
      rightElbow: 0.3,
      leftLift: 0.14,
      rightLift: 0.14,
      leftKnee: 0.28,
      rightKnee: 0.28,
    },
  },
];

/** Glacial pace score — 1 when motion is very slow, 0 when too fast. */
export function slowPaceScore(motion: number, ceiling: number): number {
  return clamp01(1 - motion / Math.max(0.02, ceiling));
}

/** Trajectory progress toward slow-motion end pose. */
export function slowTrajectoryScore(
  m: PostureMetrics,
  round: SlowMotionRound,
  tolerance: number,
): { score: number; armsScore: number; legsScore: number; readout: FullBodyReadout } {
  const match = matchFullBodyPose(m, round.end, tolerance);
  return {
    score: match.score,
    armsScore: match.armsScore,
    legsScore: match.legsScore,
    readout: match.readout,
  };
}

/** Controlled calibration effort while gliding along the slow path. */
export function calibrationEffortScore(
  m: PostureMetrics,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  controlled: number,
  trajectory: number,
  pace: number,
): number {
  const upright = uprightScore(m, postureBase);
  const squeeze = squeezeScore(m, forceBase);
  const idealSqueeze = 0.3;
  const steady = clamp01(1 - Math.abs(squeeze - idealSqueeze) / 0.34);
  const forward = forwardPressScore(m, forceBase);
  const glide = clamp01(trajectory * 0.38 + pace * 0.32 + upright * 0.18 + steady * 0.12);
  return clamp01(controlled * 0.52 + glide * 0.48 + forward * 0.08);
}

/** Slow motion power — trajectory + glacial pace + controlled calibration effort. */
export function slowMotionPowerScore(
  m: PostureMetrics,
  round: SlowMotionRound,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  tolerance: number,
  controlled: number,
  motion: number,
  speedCeiling: number,
): number {
  const trajectory = slowTrajectoryScore(m, round, tolerance);
  const pace = slowPaceScore(motion, speedCeiling);
  const effort = calibrationEffortScore(m, postureBase, forceBase, controlled, trajectory.score, pace);
  return clamp01(trajectory.score * 0.44 + pace * 0.28 + effort * 0.28);
}

export type FastDashRound = {
  id: string;
  name: string;
  icon: string;
  label: string;
  start: FullBodyPoseTarget;
  end: FullBodyPoseTarget;
};

/** Eight turbo dash checkpoint bursts — fast snap to target pose. */
export const FAST_DASH_ROUNDS: FastDashRound[] = [
  {
    id: 'arm-snap',
    name: 'Arm Snap',
    icon: '💪',
    label: 'ARM SNAP',
    start: {
      id: 'arm-snap-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'arm-snap-end',
      name: 'Arm Snap',
      icon: '💪',
      leftRaise: 0.82,
      rightRaise: 0.82,
      leftElbow: 0.24,
      rightElbow: 0.24,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'power-lunge',
    name: 'Power Lunge',
    icon: '🏃',
    label: 'LUNGE',
    start: {
      id: 'lunge-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'lunge-end',
      name: 'Power Lunge',
      icon: '🏃',
      leftRaise: 0.68,
      rightRaise: 0.22,
      leftElbow: 0.42,
      rightElbow: 0.22,
      leftLift: 0.22,
      rightLift: 0.56,
      leftKnee: 0.58,
      rightKnee: 0.28,
    },
  },
  {
    id: 'side-sprint',
    name: 'Side Sprint',
    icon: '🙌',
    label: 'SIDE SPRINT',
    start: {
      id: 'side-sprint-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'side-sprint-end',
      name: 'Side Sprint',
      icon: '🙌',
      leftRaise: 0.32,
      rightRaise: 0.88,
      leftElbow: 0.28,
      rightElbow: 0.18,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'knee-pop',
    name: 'Knee Pop',
    icon: '🦵',
    label: 'KNEE POP',
    start: {
      id: 'knee-pop-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'knee-pop-end',
      name: 'Knee Pop',
      icon: '🦵',
      leftRaise: 0.34,
      rightRaise: 0.34,
      leftElbow: 0.3,
      rightElbow: 0.3,
      leftLift: 0.62,
      rightLift: 0.1,
      leftKnee: 0.44,
      rightKnee: 0.12,
    },
  },
  {
    id: 'squat-snap',
    name: 'Squat Snap',
    icon: '⬇️',
    label: 'SQUAT SNAP',
    start: {
      id: 'squat-snap-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'squat-snap-end',
      name: 'Squat Snap',
      icon: '⬇️',
      leftRaise: 0.42,
      rightRaise: 0.42,
      leftElbow: 0.46,
      rightElbow: 0.46,
      leftLift: 0.2,
      rightLift: 0.2,
      leftKnee: 0.76,
      rightKnee: 0.76,
    },
  },
  {
    id: 'star-burst',
    name: 'Star Burst',
    icon: '⭐',
    label: 'STAR BURST',
    start: {
      id: 'star-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'star-end',
      name: 'Star Burst',
      icon: '⭐',
      leftRaise: 0.92,
      rightRaise: 0.92,
      leftElbow: 0.16,
      rightElbow: 0.16,
      leftLift: 0.22,
      rightLift: 0.22,
      leftKnee: 0.32,
      rightKnee: 0.32,
    },
  },
  {
    id: 'cross-dash',
    name: 'Cross Dash',
    icon: '↔️',
    label: 'CROSS DASH',
    start: {
      id: 'cross-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'cross-end',
      name: 'Cross Dash',
      icon: '↔️',
      leftRaise: 0.86,
      rightRaise: 0.3,
      leftElbow: 0.34,
      rightElbow: 0.38,
      leftLift: 0.52,
      rightLift: 0.12,
      leftKnee: 0.38,
      rightKnee: 0.14,
    },
  },
  {
    id: 'full-turbo',
    name: 'Full Turbo',
    icon: '🌟',
    label: 'FULL TURBO',
    start: {
      id: 'turbo-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'turbo-end',
      name: 'Full Turbo',
      icon: '🌟',
      leftRaise: 0.78,
      rightRaise: 0.78,
      leftElbow: 0.32,
      rightElbow: 0.32,
      leftLift: 0.18,
      rightLift: 0.18,
      leftKnee: 0.36,
      rightKnee: 0.36,
    },
  },
];

/** Turbo burst score — sweet spot between min dash speed and reckless max. */
export function dashBurstScore(intensity: number, burstMin: number, burstMax: number): number {
  if (intensity < burstMin) return clamp01(intensity / Math.max(0.12, burstMin)) * 0.55;
  if (intensity > burstMax) return clamp01(1 - (intensity - burstMax) / Math.max(0.12, 1 - burstMax)) * 0.65;
  const mid = (burstMin + burstMax) / 2;
  const band = Math.max(0.08, (burstMax - burstMin) / 2);
  return clamp01(0.74 + 0.26 * (1 - Math.abs(intensity - mid) / band));
}

/** Checkpoint reach toward dash target pose. */
export function dashReachScore(
  m: PostureMetrics,
  round: FastDashRound,
  tolerance: number,
): { score: number; armsScore: number; legsScore: number; readout: FullBodyReadout } {
  const match = matchFullBodyPose(m, round.end, tolerance);
  return {
    score: match.score,
    armsScore: match.armsScore,
    legsScore: match.legsScore,
    readout: match.readout,
  };
}

/** Controlled lock effort after turbo burst at checkpoint. */
export function dashLockEffortScore(
  m: PostureMetrics,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  controlled: number,
  reach: number,
  burst: number,
): number {
  const upright = uprightScore(m, postureBase);
  const squeeze = squeezeScore(m, forceBase);
  const idealSqueeze = 0.34;
  const lock = clamp01(1 - Math.abs(squeeze - idealSqueeze) / 0.34);
  const forward = forwardPressScore(m, forceBase);
  const settle = clamp01(reach * 0.4 + burst * 0.28 + upright * 0.2 + lock * 0.12);
  return clamp01(controlled * 0.5 + settle * 0.5 + forward * 0.08);
}

/** Fast dash power — checkpoint reach + turbo burst + controlled lock effort. */
export function fastDashPowerScore(
  m: PostureMetrics,
  round: FastDashRound,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  tolerance: number,
  controlled: number,
  intensity: number,
  burstMin: number,
  burstMax: number,
): number {
  const reach = dashReachScore(m, round, tolerance);
  const burst = dashBurstScore(intensity, burstMin, burstMax);
  const lock = dashLockEffortScore(m, postureBase, forceBase, controlled, reach.score, burst);
  return clamp01(reach.score * 0.42 + burst * 0.3 + lock * 0.28);
}

export type SpeedZoneStatus = 'slow' | 'zone' | 'fast';

export function speedZoneStatus(intensity: number, target: number, bandHalf: number): SpeedZoneStatus {
  if (intensity < target - bandHalf) return 'slow';
  if (intensity > target + bandHalf) return 'fast';
  return 'zone';
}

/** How closely current movement speed matches the target pace (0..1). */
export function speedMatchAccuracy(intensity: number, target: number, bandHalf: number): number {
  const delta = Math.abs(intensity - target);
  return clamp01(1 - delta / Math.max(bandHalf, 0.07));
}

export type MatchSpeedRound = {
  id: string;
  name: string;
  icon: string;
  label: string;
  /** Target movement intensity (0..1) for this round. */
  targetSpeed: number;
  start: FullBodyPoseTarget;
  end: FullBodyPoseTarget;
};

/** Eight paced speed-match paths — moderate calibrated movement speeds. */
export const MATCH_SPEED_ROUNDS: MatchSpeedRound[] = [
  {
    id: 'steady-march',
    name: 'Steady March',
    icon: '🚶',
    label: 'MARCH',
    targetSpeed: 0.24,
    start: {
      id: 'march-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'march-end',
      name: 'Steady March',
      icon: '🚶',
      leftRaise: 0.28,
      rightRaise: 0.28,
      leftElbow: 0.26,
      rightElbow: 0.26,
      leftLift: 0.42,
      rightLift: 0.1,
      leftKnee: 0.36,
      rightKnee: 0.12,
    },
  },
  {
    id: 'smooth-reach',
    name: 'Smooth Reach',
    icon: '🙋',
    label: 'REACH',
    targetSpeed: 0.3,
    start: {
      id: 'reach-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'reach-end',
      name: 'Smooth Reach',
      icon: '🙋',
      leftRaise: 0.68,
      rightRaise: 0.68,
      leftElbow: 0.28,
      rightElbow: 0.28,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'balanced-press',
    name: 'Balanced Press',
    icon: '🤲',
    label: 'PRESS',
    targetSpeed: 0.36,
    start: {
      id: 'press-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'press-end',
      name: 'Balanced Press',
      icon: '🤲',
      leftRaise: 0.48,
      rightRaise: 0.48,
      leftElbow: 0.62,
      rightElbow: 0.62,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.16,
      rightKnee: 0.16,
    },
  },
  {
    id: 'paced-lift',
    name: 'Paced Knee Lift',
    icon: '🦵',
    label: 'LIFT',
    targetSpeed: 0.42,
    start: {
      id: 'lift-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'lift-end',
      name: 'Paced Knee Lift',
      icon: '🦵',
      leftRaise: 0.34,
      rightRaise: 0.34,
      leftElbow: 0.3,
      rightElbow: 0.3,
      leftLift: 0.52,
      rightLift: 0.12,
      leftKnee: 0.4,
      rightKnee: 0.12,
    },
  },
  {
    id: 'tempo-squat',
    name: 'Tempo Squat',
    icon: '⬇️',
    label: 'SQUAT',
    targetSpeed: 0.48,
    start: {
      id: 'tempo-start',
      name: 'Stand',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'tempo-end',
      name: 'Tempo Squat',
      icon: '⬇️',
      leftRaise: 0.4,
      rightRaise: 0.4,
      leftElbow: 0.44,
      rightElbow: 0.44,
      leftLift: 0.18,
      rightLift: 0.18,
      leftKnee: 0.68,
      rightKnee: 0.68,
    },
  },
  {
    id: 'rhythm-spread',
    name: 'Rhythm Spread',
    icon: '🙌',
    label: 'SPREAD',
    targetSpeed: 0.54,
    start: {
      id: 'spread-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'spread-end',
      name: 'Rhythm Spread',
      icon: '🙌',
      leftRaise: 0.84,
      rightRaise: 0.84,
      leftElbow: 0.2,
      rightElbow: 0.2,
      leftLift: 0.12,
      rightLift: 0.12,
      leftKnee: 0.18,
      rightKnee: 0.18,
    },
  },
  {
    id: 'mirror-stride',
    name: 'Mirror Stride',
    icon: '🔄',
    label: 'STRIDE',
    targetSpeed: 0.58,
    start: {
      id: 'stride-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'stride-end',
      name: 'Mirror Stride',
      icon: '🔄',
      leftRaise: 0.62,
      rightRaise: 0.3,
      leftElbow: 0.38,
      rightElbow: 0.32,
      leftLift: 0.48,
      rightLift: 0.14,
      leftKnee: 0.34,
      rightKnee: 0.14,
    },
  },
  {
    id: 'full-sync',
    name: 'Full Speed Sync',
    icon: '🌟',
    label: 'FULL SYNC',
    targetSpeed: 0.62,
    start: {
      id: 'sync-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'sync-end',
      name: 'Full Speed Sync',
      icon: '🌟',
      leftRaise: 0.74,
      rightRaise: 0.74,
      leftElbow: 0.34,
      rightElbow: 0.34,
      leftLift: 0.16,
      rightLift: 0.16,
      leftKnee: 0.32,
      rightKnee: 0.32,
    },
  },
];

/** Pose path progress for speed-match rounds. */
export function matchPathScore(
  m: PostureMetrics,
  round: MatchSpeedRound,
  tolerance: number,
): { score: number; armsScore: number; legsScore: number; readout: FullBodyReadout } {
  const match = matchFullBodyPose(m, round.end, tolerance);
  return {
    score: match.score,
    armsScore: match.armsScore,
    legsScore: match.legsScore,
    readout: match.readout,
  };
}

/** Dual-zone match effort — speed accuracy + controlled force at target pace. */
export function matchSyncEffortScore(
  m: PostureMetrics,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  controlled: number,
  pathScore: number,
  speedAcc: number,
): number {
  const upright = uprightScore(m, postureBase);
  const squeeze = squeezeScore(m, forceBase);
  const idealSqueeze = 0.32;
  const steady = clamp01(1 - Math.abs(squeeze - idealSqueeze) / 0.34);
  const forward = forwardPressScore(m, forceBase);
  const sync = clamp01(pathScore * 0.36 + speedAcc * 0.34 + upright * 0.18 + steady * 0.12);
  return clamp01(controlled * 0.5 + sync * 0.5 + forward * 0.06);
}

/** Match My Speed power — path + speed match + controlled sync effort. */
export function matchSpeedPowerScore(
  m: PostureMetrics,
  round: MatchSpeedRound,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  tolerance: number,
  controlled: number,
  intensity: number,
  speedBandHalf: number,
): number {
  const path = matchPathScore(m, round, tolerance);
  const speedAcc = speedMatchAccuracy(intensity, round.targetSpeed, speedBandHalf);
  const effort = matchSyncEffortScore(m, postureBase, forceBase, controlled, path.score, speedAcc);
  return clamp01(path.score * 0.4 + speedAcc * 0.32 + effort * 0.28);
}

export type BracketZoneStatus = 'below' | 'in' | 'above';

export function speedBracketStatus(intensity: number, min: number, max: number): BracketZoneStatus {
  if (intensity < min) return 'below';
  if (intensity > max) return 'above';
  return 'in';
}

/** Score for staying inside the speed corridor band (0..1). */
export function speedBracketScore(intensity: number, min: number, max: number): number {
  if (intensity < min) return clamp01(intensity / Math.max(0.1, min)) * 0.5;
  if (intensity > max) return clamp01(1 - (intensity - max) / Math.max(0.12, 1 - max)) * 0.55;
  const mid = (min + max) / 2;
  const half = Math.max(0.06, (max - min) / 2);
  return clamp01(0.78 + 0.22 * (1 - Math.abs(intensity - mid) / half));
}

/** Steady speed stability within the corridor — low drift from corridor center. */
export function speedStabilityScore(intensity: number, min: number, max: number, bracketScore: number): number {
  const mid = (min + max) / 2;
  const half = Math.max(0.06, (max - min) / 2);
  const drift = clamp01(1 - Math.abs(intensity - mid) / half);
  return clamp01(bracketScore * 0.55 + drift * 0.45);
}

export type SpeedControlRound = {
  id: string;
  name: string;
  icon: string;
  label: string;
  speedMin: number;
  speedMax: number;
  start: FullBodyPoseTarget;
  end: FullBodyPoseTarget;
};

/** Eight speed-corridor control paths — regulated bracket bands. */
export const SPEED_CONTROL_ROUNDS: SpeedControlRound[] = [
  {
    id: 'gentle-glide',
    name: 'Gentle Glide',
    icon: '🌊',
    label: 'GLIDE',
    speedMin: 0.16,
    speedMax: 0.3,
    start: {
      id: 'glide-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'glide-end',
      name: 'Gentle Glide',
      icon: '🌊',
      leftRaise: 0.58,
      rightRaise: 0.58,
      leftElbow: 0.3,
      rightElbow: 0.3,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'steady-lane',
    name: 'Steady Lane',
    icon: '🚶',
    label: 'STEADY',
    speedMin: 0.2,
    speedMax: 0.36,
    start: {
      id: 'steady-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'steady-end',
      name: 'Steady Lane',
      icon: '🚶',
      leftRaise: 0.32,
      rightRaise: 0.32,
      leftElbow: 0.28,
      rightElbow: 0.28,
      leftLift: 0.38,
      rightLift: 0.1,
      leftKnee: 0.34,
      rightKnee: 0.12,
    },
  },
  {
    id: 'balance-band',
    name: 'Balance Band',
    icon: '🙋',
    label: 'BALANCE',
    speedMin: 0.24,
    speedMax: 0.4,
    start: {
      id: 'balance-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'balance-end',
      name: 'Balance Band',
      icon: '🙋',
      leftRaise: 0.7,
      rightRaise: 0.7,
      leftElbow: 0.26,
      rightElbow: 0.26,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'cruise-corridor',
    name: 'Cruise Corridor',
    icon: '🦵',
    label: 'CRUISE',
    speedMin: 0.28,
    speedMax: 0.44,
    start: {
      id: 'cruise-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'cruise-end',
      name: 'Cruise Corridor',
      icon: '🦵',
      leftRaise: 0.36,
      rightRaise: 0.36,
      leftElbow: 0.32,
      rightElbow: 0.32,
      leftLift: 0.5,
      rightLift: 0.12,
      leftKnee: 0.4,
      rightKnee: 0.12,
    },
  },
  {
    id: 'mid-lane',
    name: 'Mid Lane',
    icon: '⬇️',
    label: 'MID LANE',
    speedMin: 0.32,
    speedMax: 0.48,
    start: {
      id: 'mid-start',
      name: 'Stand',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'mid-end',
      name: 'Mid Lane',
      icon: '⬇️',
      leftRaise: 0.44,
      rightRaise: 0.44,
      leftElbow: 0.46,
      rightElbow: 0.46,
      leftLift: 0.2,
      rightLift: 0.2,
      leftKnee: 0.7,
      rightKnee: 0.7,
    },
  },
  {
    id: 'active-band',
    name: 'Active Band',
    icon: '🙌',
    label: 'ACTIVE',
    speedMin: 0.36,
    speedMax: 0.52,
    start: {
      id: 'active-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'active-end',
      name: 'Active Band',
      icon: '🙌',
      leftRaise: 0.82,
      rightRaise: 0.82,
      leftElbow: 0.22,
      rightElbow: 0.22,
      leftLift: 0.12,
      rightLift: 0.12,
      leftKnee: 0.18,
      rightKnee: 0.18,
    },
  },
  {
    id: 'power-lane',
    name: 'Power Lane',
    icon: '🔄',
    label: 'POWER',
    speedMin: 0.4,
    speedMax: 0.56,
    start: {
      id: 'power-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'power-end',
      name: 'Power Lane',
      icon: '🔄',
      leftRaise: 0.64,
      rightRaise: 0.34,
      leftElbow: 0.4,
      rightElbow: 0.34,
      leftLift: 0.46,
      rightLift: 0.14,
      leftKnee: 0.36,
      rightKnee: 0.14,
    },
  },
  {
    id: 'full-control',
    name: 'Full Control',
    icon: '🌟',
    label: 'FULL CTRL',
    speedMin: 0.44,
    speedMax: 0.6,
    start: {
      id: 'full-ctrl-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'full-ctrl-end',
      name: 'Full Control',
      icon: '🌟',
      leftRaise: 0.76,
      rightRaise: 0.76,
      leftElbow: 0.34,
      rightElbow: 0.34,
      leftLift: 0.16,
      rightLift: 0.16,
      leftKnee: 0.34,
      rightKnee: 0.34,
    },
  },
];

/** Pose path progress for speed-control rounds. */
export function controlPathScore(
  m: PostureMetrics,
  round: SpeedControlRound,
  tolerance: number,
): { score: number; armsScore: number; legsScore: number; readout: FullBodyReadout } {
  const match = matchFullBodyPose(m, round.end, tolerance);
  return {
    score: match.score,
    armsScore: match.armsScore,
    legsScore: match.legsScore,
    readout: match.readout,
  };
}

/** Governor effort while regulating speed inside corridor. */
export function governorEffortScore(
  m: PostureMetrics,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  controlled: number,
  pathScore: number,
  bracket: number,
  stability: number,
): number {
  const upright = uprightScore(m, postureBase);
  const squeeze = squeezeScore(m, forceBase);
  const idealSqueeze = 0.33;
  const steady = clamp01(1 - Math.abs(squeeze - idealSqueeze) / 0.34);
  const forward = forwardPressScore(m, forceBase);
  const govern = clamp01(pathScore * 0.34 + bracket * 0.3 + stability * 0.2 + upright * 0.16);
  return clamp01(controlled * 0.5 + govern * 0.5 + steady * 0.06 + forward * 0.06);
}

/** Speed control power — path + corridor bracket + governor effort. */
export function speedControlPowerScore(
  m: PostureMetrics,
  round: SpeedControlRound,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  tolerance: number,
  controlled: number,
  intensity: number,
): number {
  const path = controlPathScore(m, round, tolerance);
  const bracket = speedBracketScore(intensity, round.speedMin, round.speedMax);
  const stability = speedStabilityScore(intensity, round.speedMin, round.speedMax, bracket);
  const effort = governorEffortScore(m, postureBase, forceBase, controlled, path.score, bracket, stability);
  return clamp01(path.score * 0.38 + bracket * 0.3 + stability * 0.14 + effort * 0.18);
}

/** Linear blend between start and end pose for beat-step preview. */
export function lerpPoseTarget(start: FullBodyPoseTarget, end: FullBodyPoseTarget, t: number): FullBodyPoseTarget {
  const u = clamp01(t);
  return {
    ...end,
    id: end.id,
    name: end.name,
    icon: end.icon,
    leftRaise: start.leftRaise + (end.leftRaise - start.leftRaise) * u,
    rightRaise: start.rightRaise + (end.rightRaise - start.rightRaise) * u,
    leftElbow: start.leftElbow + (end.leftElbow - start.leftElbow) * u,
    rightElbow: start.rightElbow + (end.rightElbow - start.rightElbow) * u,
    leftLift: start.leftLift + (end.leftLift - start.leftLift) * u,
    rightLift: start.rightLift + (end.rightLift - start.rightLift) * u,
    leftKnee: start.leftKnee + (end.leftKnee - start.leftKnee) * u,
    rightKnee: start.rightKnee + (end.rightKnee - start.rightKnee) * u,
  };
}

export type RhythmMoveRound = {
  id: string;
  name: string;
  icon: string;
  label: string;
  beats: number;
  beatIntervalMs: number;
  start: FullBodyPoseTarget;
  end: FullBodyPoseTarget;
};

/** Eight beat-synced rhythm movement paths — tempo increases each round. */
export const RHYTHM_MOVE_ROUNDS: RhythmMoveRound[] = [
  {
    id: 'slow-step',
    name: 'Slow Step',
    icon: '👣',
    label: 'SLOW STEP',
    beats: 4,
    beatIntervalMs: 1100,
    start: {
      id: 'slow-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'slow-end',
      name: 'Slow Step',
      icon: '👣',
      leftRaise: 0.3,
      rightRaise: 0.3,
      leftElbow: 0.26,
      rightElbow: 0.26,
      leftLift: 0.4,
      rightLift: 0.1,
      leftKnee: 0.34,
      rightKnee: 0.12,
    },
  },
  {
    id: 'walk-beat',
    name: 'Walk Beat',
    icon: '🙋',
    label: 'WALK BEAT',
    beats: 4,
    beatIntervalMs: 1000,
    start: {
      id: 'walk-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'walk-end',
      name: 'Walk Beat',
      icon: '🙋',
      leftRaise: 0.64,
      rightRaise: 0.64,
      leftElbow: 0.28,
      rightElbow: 0.28,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'march-pulse',
    name: 'March Pulse',
    icon: '🤲',
    label: 'MARCH',
    beats: 4,
    beatIntervalMs: 920,
    start: {
      id: 'march-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'march-end',
      name: 'March Pulse',
      icon: '🤲',
      leftRaise: 0.46,
      rightRaise: 0.46,
      leftElbow: 0.58,
      rightElbow: 0.58,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.16,
      rightKnee: 0.16,
    },
  },
  {
    id: 'reach-rhythm',
    name: 'Reach Rhythm',
    icon: '🦵',
    label: 'REACH',
    beats: 4,
    beatIntervalMs: 860,
    start: {
      id: 'reach-rhythm-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'reach-rhythm-end',
      name: 'Reach Rhythm',
      icon: '🦵',
      leftRaise: 0.36,
      rightRaise: 0.36,
      leftElbow: 0.32,
      rightElbow: 0.32,
      leftLift: 0.54,
      rightLift: 0.12,
      leftKnee: 0.42,
      rightKnee: 0.12,
    },
  },
  {
    id: 'squat-beat',
    name: 'Squat Beat',
    icon: '⬇️',
    label: 'SQUAT',
    beats: 4,
    beatIntervalMs: 800,
    start: {
      id: 'squat-beat-start',
      name: 'Stand',
      icon: '🧍',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'squat-beat-end',
      name: 'Squat Beat',
      icon: '⬇️',
      leftRaise: 0.42,
      rightRaise: 0.42,
      leftElbow: 0.44,
      rightElbow: 0.44,
      leftLift: 0.2,
      rightLift: 0.2,
      leftKnee: 0.72,
      rightKnee: 0.72,
    },
  },
  {
    id: 'side-groove',
    name: 'Side Groove',
    icon: '🙌',
    label: 'GROOVE',
    beats: 4,
    beatIntervalMs: 760,
    start: {
      id: 'groove-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'groove-end',
      name: 'Side Groove',
      icon: '🙌',
      leftRaise: 0.8,
      rightRaise: 0.32,
      leftElbow: 0.3,
      rightElbow: 0.32,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'power-beat',
    name: 'Power Beat',
    icon: '💃',
    label: 'POWER',
    beats: 4,
    beatIntervalMs: 720,
    start: {
      id: 'power-beat-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'power-beat-end',
      name: 'Power Beat',
      icon: '💃',
      leftRaise: 0.86,
      rightRaise: 0.86,
      leftElbow: 0.24,
      rightElbow: 0.24,
      leftLift: 0.14,
      rightLift: 0.14,
      leftKnee: 0.2,
      rightKnee: 0.2,
    },
  },
  {
    id: 'full-rhythm',
    name: 'Full Rhythm',
    icon: '🌟',
    label: 'FULL BEAT',
    beats: 4,
    beatIntervalMs: 680,
    start: {
      id: 'full-rhythm-start',
      name: 'Ready',
      icon: '🧍',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
    end: {
      id: 'full-rhythm-end',
      name: 'Full Rhythm',
      icon: '🌟',
      leftRaise: 0.76,
      rightRaise: 0.76,
      leftElbow: 0.34,
      rightElbow: 0.34,
      leftLift: 0.16,
      rightLift: 0.16,
      leftKnee: 0.34,
      rightKnee: 0.34,
    },
  },
];

/** Beat alignment score from hits vs total beats. */
export function rhythmBeatScore(hits: number, total: number): number {
  if (total <= 0) return 0;
  return clamp01(hits / total);
}

/** Pose path for rhythm round — match end target. */
export function rhythmPathScore(
  m: PostureMetrics,
  round: RhythmMoveRound,
  tolerance: number,
): { score: number; armsScore: number; legsScore: number; readout: FullBodyReadout } {
  const match = matchFullBodyPose(m, round.end, tolerance);
  return {
    score: match.score,
    armsScore: match.armsScore,
    legsScore: match.legsScore,
    readout: match.readout,
  };
}

/** Controlled rhythm effort on beat + pose path. */
export function rhythmGrooveEffortScore(
  m: PostureMetrics,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  controlled: number,
  pathScore: number,
  beatScore: number,
): number {
  const upright = uprightScore(m, postureBase);
  const squeeze = squeezeScore(m, forceBase);
  const idealSqueeze = 0.32;
  const steady = clamp01(1 - Math.abs(squeeze - idealSqueeze) / 0.34);
  const forward = forwardPressScore(m, forceBase);
  const groove = clamp01(pathScore * 0.38 + beatScore * 0.36 + upright * 0.18 + steady * 0.08);
  return clamp01(controlled * 0.5 + groove * 0.5 + forward * 0.06);
}

/** Rhythm move power — beat alignment + path + groove effort. */
export function rhythmMovePowerScore(
  m: PostureMetrics,
  round: RhythmMoveRound,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  tolerance: number,
  controlled: number,
  beatHits: number,
): number {
  const path = rhythmPathScore(m, round, tolerance);
  const beats = rhythmBeatScore(beatHits, round.beats);
  const effort = rhythmGrooveEffortScore(m, postureBase, forceBase, controlled, path.score, beats);
  return clamp01(path.score * 0.4 + beats * 0.32 + effort * 0.28);
}
