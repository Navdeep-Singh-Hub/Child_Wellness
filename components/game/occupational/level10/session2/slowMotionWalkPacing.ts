/** Pacing — OT Level 10 Session 2 · Game 2 Slow Motion Walk */
export const SLOW_MOTION_WALK_PACING = {
  waypoints: 5,
  calibrationMs: 2800,
  tickMs: 80,
  holdToReachMs: 2000,
  holdGraceMs: 350,
  betweenWaypointsMs: 900,
  roundIntroMs: 800,
  fallbackReachMs: 2800,
  starEveryNWaypoints: 2,
  quickReachBonusMs: 4500,
  /** Max normalized movement per tick to count as "slow". */
  maxSlowMotionNorm: 0.022,
  /** Movement above this triggers fast penalty. */
  fastMotionNorm: 0.045,
} as const;
