import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inProblemZone } from '@/components/game/occupational/level10/session8/problemSolvingUtils';

export function inSolverZone(cursor: Point | null, zone: Point & { radius: number }): boolean {
  return inProblemZone(cursor, zone);
}
