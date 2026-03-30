/**
 * Helpers for Color Scribble Fill: parse SVG path to points, point-in-polygon, area.
 */

export interface Point {
  x: number;
  y: number;
}

/** Parse simple SVG path (M x y L x y L x y ...) to array of points */
export function pathToPoints(path: string): Point[] {
  const points: Point[] = [];
  const parts = path.trim().split(/[\s,]+/);
  let i = 0;
  let current: Point | null = null;
  while (i < parts.length) {
    if (parts[i] === 'M' || parts[i] === 'L') {
      i++;
      if (i + 1 < parts.length) {
        const x = parseFloat(parts[i]);
        const y = parseFloat(parts[i + 1]);
        if (!Number.isNaN(x) && !Number.isNaN(y)) {
          current = { x, y };
          points.push(current);
        }
        i += 2;
      }
    } else if (parts[i] === 'm') {
      i++;
      if (i + 1 < parts.length) {
        const dx = parseFloat(parts[i]);
        const dy = parseFloat(parts[i + 1]);
        if (!Number.isNaN(dx) && !Number.isNaN(dy) && current) {
          current = { x: current.x + dx, y: current.y + dy };
          points.push(current);
        }
        i += 2;
      }
    } else {
      const x = parseFloat(parts[i]);
      const y = parseFloat(parts[i + 1]);
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        current = { x, y };
        points.push(current);
        i += 2;
      } else {
        i++;
      }
    }
  }
  return points;
}

/** Ray-casting point-in-polygon */
export function pointInPolygon(p: Point, polygon: Point[]): boolean {
  const n = polygon.length;
  if (n < 3) return false;
  let inside = false;
  const x = p.x;
  const y = p.y;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Shoelace formula for polygon area */
export function polygonArea(polygon: Point[]): number {
  const n = polygon.length;
  if (n < 3) return 0;
  let area = 0;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    area += polygon[j].x * polygon[i].y - polygon[i].x * polygon[j].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Perpendicular distance from point p to the line segment a→b.
 * Returns the shortest distance from p to any point on segment [a, b].
 */
export function pointToSegmentDist(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/**
 * Check which target dots are "connected" by drawn strokes.
 * Uses analytical point-to-segment distance so that dots between two
 * consecutive touch points are still detected (no interpolation needed).
 */
export function getConnectedDots(
  strokes: { path: string }[],
  dots: Point[],
  hitRadius: number
): Set<number> {
  const connected = new Set<number>();
  for (const s of strokes) {
    const pts = pathToPoints(s.path);
    if (pts.length === 0) continue;
    for (let di = 0; di < dots.length; di++) {
      if (connected.has(di)) continue;
      const dot = dots[di];
      if (pts.length === 1) {
        if (Math.hypot(dot.x - pts[0].x, dot.y - pts[0].y) <= hitRadius) connected.add(di);
        continue;
      }
      for (let pi = 0; pi < pts.length - 1; pi++) {
        if (pointToSegmentDist(dot, pts[pi], pts[pi + 1]) <= hitRadius) {
          connected.add(di);
          break;
        }
      }
    }
  }
  return connected;
}

/**
 * Coverage percentage: what fraction of samplePts are near any drawn stroke.
 * Uses segment-based distance for accuracy.
 */
export function coveragePctSegment(
  drawStrokes: { path: string }[],
  samplePts: Point[],
  hitRadius: number
): number {
  const hit = getConnectedDots(drawStrokes, samplePts, hitRadius);
  return samplePts.length > 0 ? hit.size / samplePts.length : 0;
}

/**
 * Sample points along one template segment (from→to), same spacing idea as letter guides.
 */
export function sampleSegmentPoints(
  from: Point,
  to: Point,
  sampleStepPx: number
): Point[] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const steps = Math.max(2, Math.ceil(Math.hypot(dx, dy) / Math.max(4, sampleStepPx)));
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({ x: from.x + dx * t, y: from.y + dy * t });
  }
  return pts;
}

/**
 * Minimum coverage across each guide segment. Prevents one long stroke (e.g. Z diagonal)
 * from satisfying samples that belong to another segment (e.g. bottom bar).
 */
export function coveragePctMinOverGuideSegments(
  drawStrokes: { path: string }[],
  templateSegments: Array<{ from: Point; to: Point }>,
  hitRadius: number,
  sampleStepPx: number
): number {
  if (templateSegments.length === 0) return 0;
  let minCov = 1;
  for (const seg of templateSegments) {
    const segSamples = sampleSegmentPoints(seg.from, seg.to, sampleStepPx);
    const cov = coveragePctSegment(drawStrokes, segSamples, hitRadius);
    minCov = Math.min(minCov, cov);
  }
  return minCov;
}

/** Per-stroke coverage (0–1) for UI: highlight parts of the outline still missing. */
export function coveragePerGuideSegment(
  drawStrokes: { path: string }[],
  templateSegments: Array<{ from: Point; to: Point }>,
  hitRadius: number,
  sampleStepPx: number
): number[] {
  return templateSegments.map((seg) => {
    const segSamples = sampleSegmentPoints(seg.from, seg.to, sampleStepPx);
    return coveragePctSegment(drawStrokes, segSamples, hitRadius);
  });
}

/** Concatenate all stroke paths into one polyline (pen lifts ignored). */
export function strokesToPolylinePoints(strokes: { path: string }[]): Point[] {
  const out: Point[] = [];
  for (const s of strokes) {
    for (const p of pathToPoints(s.path)) out.push(p);
  }
  return out;
}

function normalizePointsUnitSquare(pts: Point[], paddingRatio: number): Point[] {
  if (pts.length === 0) return [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const w = maxX - minX;
  const h = maxY - minY;
  const pad = Math.max(w, h) * paddingRatio;
  const s = Math.max(w, h) + 2 * pad;
  if (s < 1e-6) return pts.map(() => ({ x: 0.5, y: 0.5 }));
  const ox = minX - pad;
  const oy = minY - pad;
  return pts.map((p) => ({ x: (p.x - ox) / s, y: (p.y - oy) / s }));
}

function polylineSegments(pts: Point[]): Array<[Point, Point]> {
  const segs: Array<[Point, Point]> = [];
  for (let i = 0; i < pts.length - 1; i++) segs.push([pts[i], pts[i + 1]]);
  return segs;
}

function meanMinDistToSegments(pts: Point[], segs: Array<[Point, Point]>): number {
  if (pts.length === 0 || segs.length === 0) return 1;
  let sum = 0;
  for (const p of pts) {
    let m = Infinity;
    for (const [a, b] of segs) m = Math.min(m, pointToSegmentDist(p, a, b));
    sum += m;
  }
  return sum / pts.length;
}

function resamplePolylineEvenly(pts: Point[], count: number): Point[] {
  if (pts.length === 0) return [];
  if (pts.length === 1) return Array.from({ length: count }, () => ({ ...pts[0] }));
  const segLens: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    segLens.push(d);
    total += d;
  }
  if (total < 1e-6) return [pts[0]];
  const out: Point[] = [];
  for (let k = 0; k < count; k++) {
    const target = (k / Math.max(1, count - 1)) * total;
    let acc = 0;
    let j = 0;
    for (; j < segLens.length; j++) {
      if (acc + segLens[j] >= target) {
        const t = (target - acc) / Math.max(segLens[j], 1e-6);
        const a = pts[j];
        const b = pts[j + 1];
        out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
        break;
      }
      acc += segLens[j];
    }
    if (j >= segLens.length) out.push({ ...pts[pts.length - 1] });
  }
  return out;
}

/**
 * Scale-invariant shape similarity in [0, 1]: both polylines are normalized to a unit square
 * independently, then compared with bidirectional mean min-distance (Chamfer-style).
 */
export function letterShapeSimilarityScore(
  templateSamplePts: Point[],
  drawStrokes: { path: string }[],
  options?: { resample?: number; paddingRatio?: number; sigma?: number }
): number {
  const resample = options?.resample ?? 56;
  const padding = options?.paddingRatio ?? 0.08;
  const sigma = options?.sigma ?? 0.14;

  const rawUser = strokesToPolylinePoints(drawStrokes);
  if (templateSamplePts.length === 0 || rawUser.length === 0) return 0;

  const tpl = resamplePolylineEvenly(templateSamplePts, resample);
  const usr = resamplePolylineEvenly(rawUser, resample);

  const tn = normalizePointsUnitSquare(tpl, padding);
  const un = normalizePointsUnitSquare(usr, padding);
  if (tn.length === 0 || un.length === 0) return 0;

  const tSegs = polylineSegments(tn);
  const uSegs = polylineSegments(un);
  if (tSegs.length === 0 || uSegs.length === 0) return 0;

  const d1 = meanMinDistToSegments(tn, uSegs);
  const d2 = meanMinDistToSegments(un, tSegs);
  const d = (d1 + d2) / 2;
  return Math.min(1, Math.exp(-d / sigma));
}

export interface LetterCopyMatchResult {
  combined: number;
  shape: number;
  coverage: number;
  coverageLoose: number;
}

/**
 * Hybrid match for copy / free-write tasks: combines scale-invariant shape similarity
 * with template coverage. Handles different size, position, and stroke length better than
 * coverage alone.
 */
export function letterCopyMatchScore(
  drawStrokes: { path: string }[],
  templateSamplePts: Point[],
  options?: {
    coverageHitRadius?: number;
    looseRadiusFactor?: number;
    shapeWeight?: number;
    shapeSigma?: number;
  }
): LetterCopyMatchResult {
  const r = options?.coverageHitRadius ?? 30;
  const looseF = options?.looseRadiusFactor ?? 1.28;
  const w = options?.shapeWeight ?? 0.52;
  const sigma = options?.shapeSigma ?? 0.14;

  const shape = letterShapeSimilarityScore(templateSamplePts, drawStrokes, { sigma });
  const coverage = coveragePctSegment(drawStrokes, templateSamplePts, r);
  const coverageLoose = coveragePctSegment(drawStrokes, templateSamplePts, r * looseF);
  const cov = Math.max(coverage, coverageLoose * 0.92);
  const combined = w * shape + (1 - w) * Math.min(1, cov);
  return { combined, shape, coverage, coverageLoose };
}

/** Pass/fail for games using {@link letterCopyMatchScore} — tune per activity type */
export function letterMatchPass(
  r: LetterCopyMatchResult,
  mode: 'copy' | 'freeWrite' | 'speed' | 'master' | 'fun'
): boolean {
  const { combined, shape, coverage } = r;
  switch (mode) {
    case 'copy':
      return combined >= 0.44 || shape >= 0.42 || coverage >= 0.52;
    case 'freeWrite':
      return combined >= 0.4 || shape >= 0.36 || coverage >= 0.45;
    case 'speed':
      return combined >= 0.38 || shape >= 0.34 || coverage >= 0.42;
    case 'master':
      return combined >= 0.42 || shape >= 0.38 || coverage >= 0.48;
    case 'fun':
      return combined >= 0.35 || shape >= 0.3 || coverage >= 0.35;
    default:
      return combined >= 0.42;
  }
}

export interface LetterTemplateCandidate {
  label: string;
  samplePts: Point[];
}

export interface LetterClassificationResult {
  label: string;
  confidence: number;
  secondLabel: string;
  secondConfidence: number;
  /** Raw cosine similarity of top / second template (0–1) */
  topRawScore: number;
  secondRawScore: number;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function drawLineOnGrid(grid: Float32Array, size: number, a: Point, b: Point): void {
  const x0 = Math.round(clamp01(a.x) * (size - 1));
  const y0 = Math.round(clamp01(a.y) * (size - 1));
  const x1 = Math.round(clamp01(b.x) * (size - 1));
  const y1 = Math.round(clamp01(b.y) * (size - 1));

  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    const idx = y * size + x;
    if (idx >= 0 && idx < grid.length) grid[idx] = 1;
    if (x === x1 && y === y1) break;
    const e2 = err * 2;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

function polylineToRaster(pts: Point[], size = 40): Float32Array {
  const grid = new Float32Array(size * size);
  if (pts.length === 0) return grid;
  const n = normalizePointsUnitSquare(pts, 0.08);
  if (n.length < 2) {
    const p = n[0];
    const x = Math.round(clamp01(p.x) * (size - 1));
    const y = Math.round(clamp01(p.y) * (size - 1));
    grid[y * size + x] = 1;
    return grid;
  }
  for (let i = 0; i < n.length - 1; i++) drawLineOnGrid(grid, size, n[i], n[i + 1]);
  return grid;
}

function cosineSim(a: Float32Array, b: Float32Array): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const den = Math.sqrt(na) * Math.sqrt(nb);
  if (den < 1e-8) return 0;
  return dot / den;
}

/**
 * QuickDraw-style raster classification (template-based):
 * - normalize user strokes to unit square
 * - rasterize to a small grayscale grid
 * - compare cosine similarity against candidate letter template rasters
 */
export function classifyLetterFromStrokes(
  drawStrokes: { path: string }[],
  candidates: LetterTemplateCandidate[],
  rasterSize = 40
): LetterClassificationResult {
  if (candidates.length === 0) {
    return { label: '', confidence: 0, secondLabel: '', secondConfidence: 0, topRawScore: 0, secondRawScore: 0 };
  }
  const userPts = strokesToPolylinePoints(drawStrokes);
  if (userPts.length < 2) {
    return { label: '', confidence: 0, secondLabel: '', secondConfidence: 0, topRawScore: 0, secondRawScore: 0 };
  }

  const userRaster = polylineToRaster(userPts, rasterSize);
  const ranked = candidates
    .map((c) => ({ label: c.label, score: cosineSim(userRaster, polylineToRaster(c.samplePts, rasterSize)) }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const second = ranked[1] ?? { label: '', score: 0 };
  // Confidence emphasizes separation from second-best candidate.
  const margin = Math.max(0, top.score - second.score);
  const confidence = clamp01(0.7 * clamp01(top.score) + 0.3 * clamp01(margin * 2.4));
  return {
    label: top.label,
    confidence,
    secondLabel: second.label,
    secondConfidence: clamp01(second.score),
    topRawScore: top.score,
    secondRawScore: second.score,
  };
}

/**
 * Total polyline length after normalizing drawing + template to the same unit-square style.
 */
export function strokeInkToTemplateRatio(
  drawStrokes: { path: string }[],
  templateSamplePts: Point[],
  paddingRatio = 0.08
): number {
  const u = strokesToPolylinePoints(drawStrokes);
  if (u.length < 2 || templateSamplePts.length < 2) return 1;
  const un = normalizePointsUnitSquare(u, paddingRatio);
  const tn = normalizePointsUnitSquare(templateSamplePts, paddingRatio);
  let userLen = 0;
  for (let i = 0; i < un.length - 1; i++) {
    userLen += Math.hypot(un[i + 1].x - un[i].x, un[i + 1].y - un[i].y);
  }
  let tplLen = 0;
  for (let i = 0; i < tn.length - 1; i++) {
    tplLen += Math.hypot(tn[i + 1].x - tn[i].x, tn[i + 1].y - tn[i].y);
  }
  if (tplLen < 1e-6) return 1;
  return userLen / tplLen;
}

/**
 * Session 8 copy games: do not pass on geometry alone (scribbles can score ~50–60% combined).
 * Requires predicted letter === target, template match strength + margin, and sane ink amount.
 */
export function letterCopyGamePass(
  match: LetterCopyMatchResult,
  cls: LetterClassificationResult,
  targetLetter: string,
  inkRatio: number
): boolean {
  if (cls.label !== targetLetter) return false;

  if (inkRatio > 5.5) return false;
  if (inkRatio > 3.6 && cls.topRawScore < 0.52) return false;

  const top = cls.topRawScore;
  const margin = cls.topRawScore - cls.secondRawScore;

  const veryStrong = top >= 0.56 && margin >= 0.065;
  const strong = top >= 0.5 && margin >= 0.045;
  const geometryTight = match.shape >= 0.48 && match.combined >= 0.54;
  const geometryOk = match.shape >= 0.44 && match.combined >= 0.51;

  if (veryStrong) return true;
  if (strong && geometryTight) return true;
  if (top >= 0.47 && margin >= 0.042 && geometryOk && inkRatio <= 3.0) return true;

  return false;
}
