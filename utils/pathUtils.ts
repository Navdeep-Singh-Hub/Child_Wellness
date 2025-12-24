// Utility functions for path calculations in curve tracing games

export interface Point {
  x: number;
  y: number;
}

export interface PathSegment {
  start: Point;
  end: Point;
  length: number;
}

/**
 * Calculate distance from a point to a line segment
 */
export function pointToLineDistance(
  point: Point,
  lineStart: Point,
  lineEnd: Point
): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx: number, yy: number;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate distance from a point to a path (series of line segments)
 */
export function pointToPathDistance(
  point: Point,
  path: Point[],
  tolerance?: number
): { distance: number; closestPoint: Point; segmentIndex: number } {
  if (path.length < 2) {
    return {
      distance: Infinity,
      closestPoint: path[0] || { x: 0, y: 0 },
      segmentIndex: 0,
    };
  }

  let minDistance = Infinity;
  let closestPoint: Point = path[0];
  let segmentIndex = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    const distance = pointToLineDistance(point, start, end);

    if (distance < minDistance) {
      minDistance = distance;
      segmentIndex = i;

      // Calculate closest point on segment
      const A = point.x - start.x;
      const B = point.y - start.y;
      const C = end.x - start.x;
      const D = end.y - start.y;
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      const param = Math.max(0, Math.min(1, lenSq !== 0 ? dot / lenSq : 0));

      closestPoint = {
        x: start.x + param * C,
        y: start.y + param * D,
      };
    }
  }

  return { distance: minDistance, closestPoint, segmentIndex };
}

/**
 * Check if a point is within tolerance of a path
 */
export function isPointOnPath(
  point: Point,
  path: Point[],
  tolerance: number
): boolean {
  const { distance } = pointToPathDistance(point, path);
  return distance <= tolerance;
}

/**
 * Snap a point to the nearest point on a path
 */
export function snapToPath(
  point: Point,
  path: Point[],
  maxSnapDistance: number = 50
): Point {
  const { distance, closestPoint } = pointToPathDistance(point, path);
  if (distance <= maxSnapDistance) {
    return closestPoint;
  }
  return point;
}

/**
 * Generate a smooth curve path using quadratic bezier control points
 */
export function generateCurvePath(
  start: Point,
  end: Point,
  controlPoint: Point,
  segments: number = 50
): Point[] {
  const path: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x =
      (1 - t) * (1 - t) * start.x +
      2 * (1 - t) * t * controlPoint.x +
      t * t * end.x;
    const y =
      (1 - t) * (1 - t) * start.y +
      2 * (1 - t) * t * controlPoint.y +
      t * t * end.y;
    path.push({ x, y });
  }
  return path;
}

/**
 * Generate an arc path (for rainbow curves)
 */
export function generateArcPath(
  center: Point,
  radius: number,
  startAngle: number,
  endAngle: number,
  segments: number = 50
): Point[] {
  const path: Point[] = [];
  const angleRange = endAngle - startAngle;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = startAngle + t * angleRange;
    path.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }
  return path;
}

/**
 * Calculate progress along a path (0 to 1)
 */
export function getPathProgress(
  point: Point,
  path: Point[],
  tolerance: number
): number {
  const { segmentIndex, closestPoint } = pointToPathDistance(point, path);
  
  if (segmentIndex === -1 || path.length < 2) return 0;

  // Calculate total path length up to current segment
  let totalLength = 0;
  let lengthToSegment = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const dx = path[i + 1].x - path[i].x;
    const dy = path[i + 1].y - path[i].y;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);
    
    if (i < segmentIndex) {
      lengthToSegment += segmentLength;
    } else if (i === segmentIndex) {
      // Calculate position within current segment
      const dxSeg = path[i + 1].x - path[i].x;
      const dySeg = path[i + 1].y - path[i].y;
      const segLength = Math.sqrt(dxSeg * dxSeg + dySeg * dySeg);
      const dxToClosest = closestPoint.x - path[i].x;
      const dyToClosest = closestPoint.y - path[i].y;
      const distToClosest = Math.sqrt(dxToClosest * dxToClosest + dyToClosest * dyToClosest);
      lengthToSegment += distToClosest;
    }
    
    totalLength += segmentLength;
  }

  return totalLength > 0 ? Math.min(1, lengthToSegment / totalLength) : 0;
}


