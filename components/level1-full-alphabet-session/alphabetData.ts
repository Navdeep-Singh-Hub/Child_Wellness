/**
 * Full A–Z capital letter definitions for guided tracing.
 * Each letter in a 100×120 unit box with dots and strokes.
 * Straight letters use auto-generated dots; curved letters use arc-based dots.
 */

export interface Point { x: number; y: number }
export interface StrokeDef { from: Point; to: Point }
export interface LetterDef { letter: string; dots: Point[]; strokes: StrokeDef[] }

function arc(cx: number, cy: number, rx: number, ry: number, sa: number, ea: number, n: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 0;
    const a = sa + t * (ea - sa);
    pts.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) });
  }
  return pts;
}

function makeDots(strokes: StrokeDef[], step = 18, minDist = 12): Point[] {
  const raw: Point[] = [];
  for (const s of strokes) {
    const d = Math.hypot(s.to.x - s.from.x, s.to.y - s.from.y);
    const n = Math.max(2, Math.ceil(d / step));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      raw.push({
        x: Math.round((s.from.x + (s.to.x - s.from.x) * t) * 10) / 10,
        y: Math.round((s.from.y + (s.to.y - s.from.y) * t) * 10) / 10,
      });
    }
  }
  const result: Point[] = [];
  for (const p of raw) {
    if (result.every(r => Math.hypot(r.x - p.x, r.y - p.y) >= minDist)) {
      result.push(p);
    }
  }
  return result;
}

function arcStrokes(cx: number, cy: number, rx: number, ry: number, sa: number, ea: number, n: number): StrokeDef[] {
  const pts = arc(cx, cy, rx, ry, sa, ea, n);
  const segs: StrokeDef[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    segs.push({ from: pts[i], to: pts[i + 1] });
  }
  return segs;
}

/** Connect sampled points into short segments (for letters that need a smooth spine, e.g. S). */
function polylineToStrokes(pts: Point[]): StrokeDef[] {
  const segs: StrokeDef[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    segs.push({ from: pts[i], to: pts[i + 1] });
  }
  return segs;
}

function dedup(pts: Point[], minDist = 10): Point[] {
  const result: Point[] = [];
  for (const p of pts) {
    if (result.every(r => Math.hypot(r.x - p.x, r.y - p.y) >= minDist)) {
      result.push(p);
    }
  }
  return result;
}

const A_STROKES: StrokeDef[] = [
  { from: { x: 10, y: 110 }, to: { x: 50, y: 10 } },
  { from: { x: 50, y: 10 }, to: { x: 90, y: 110 } },
  { from: { x: 30, y: 75 }, to: { x: 70, y: 75 } },
];

const B_STROKES: StrokeDef[] = [
  { from: { x: 25, y: 10 }, to: { x: 25, y: 110 } },
  { from: { x: 25, y: 10 }, to: { x: 55, y: 10 } },
  ...arcStrokes(55, 35, 23, 25, -Math.PI / 2, Math.PI / 2, 12),
  { from: { x: 25, y: 60 }, to: { x: 55, y: 60 } },
  ...arcStrokes(55, 85, 26, 25, -Math.PI / 2, Math.PI / 2, 12),
  { from: { x: 55, y: 110 }, to: { x: 25, y: 110 } },
];
const B_DOTS: Point[] = dedup([
  { x: 25, y: 10 }, { x: 25, y: 30 }, { x: 25, y: 50 }, { x: 25, y: 70 }, { x: 25, y: 90 }, { x: 25, y: 110 },
  { x: 42, y: 10 }, { x: 60, y: 10 },
  ...arc(52, 35, 23, 25, -Math.PI / 2, Math.PI / 2, 6),
  { x: 42, y: 60 }, { x: 60, y: 60 },
  ...arc(52, 85, 26, 25, -Math.PI / 2, Math.PI / 2, 6),
  { x: 42, y: 110 }, { x: 60, y: 110 },
]);

const C_STROKES: StrokeDef[] = arcStrokes(55, 60, 38, 48, -Math.PI / 4, -7 * Math.PI / 4, 24);
const C_DOTS: Point[] = arc(55, 60, 38, 48, -Math.PI / 4, -7 * Math.PI / 4, 14);

const D_STROKES: StrokeDef[] = [
  { from: { x: 25, y: 10 }, to: { x: 25, y: 110 } },
  { from: { x: 25, y: 10 }, to: { x: 50, y: 10 } },
  ...arcStrokes(50, 60, 30, 50, -Math.PI / 2, Math.PI / 2, 14),
  { from: { x: 50, y: 110 }, to: { x: 25, y: 110 } },
];
const D_DOTS: Point[] = dedup([
  { x: 25, y: 10 }, { x: 25, y: 35 }, { x: 25, y: 60 }, { x: 25, y: 85 }, { x: 25, y: 110 },
  { x: 40, y: 10 }, { x: 55, y: 10 },
  ...arc(50, 60, 30, 50, -Math.PI / 2, Math.PI / 2, 8),
  { x: 40, y: 110 }, { x: 55, y: 110 },
]);

const E_STROKES: StrokeDef[] = [
  { from: { x: 25, y: 10 }, to: { x: 75, y: 10 } },
  { from: { x: 25, y: 10 }, to: { x: 25, y: 110 } },
  { from: { x: 25, y: 60 }, to: { x: 65, y: 60 } },
  { from: { x: 25, y: 110 }, to: { x: 75, y: 110 } },
];

const F_STROKES: StrokeDef[] = [
  { from: { x: 25, y: 10 }, to: { x: 75, y: 10 } },
  { from: { x: 25, y: 10 }, to: { x: 25, y: 110 } },
  { from: { x: 25, y: 60 }, to: { x: 65, y: 60 } },
];

const G_STROKES: StrokeDef[] = [
  ...arcStrokes(55, 60, 38, 48, -Math.PI / 4, -7 * Math.PI / 4, 24),
  { from: { x: 82, y: 94 }, to: { x: 82, y: 60 } },
  { from: { x: 82, y: 60 }, to: { x: 55, y: 60 } },
];
const G_DOTS: Point[] = dedup([
  ...arc(55, 60, 38, 48, -Math.PI / 4, -7 * Math.PI / 4, 14),
  { x: 82, y: 80 }, { x: 82, y: 60 },
  { x: 70, y: 60 }, { x: 55, y: 60 },
]);

const H_STROKES: StrokeDef[] = [
  { from: { x: 20, y: 10 }, to: { x: 20, y: 110 } },
  { from: { x: 20, y: 60 }, to: { x: 80, y: 60 } },
  { from: { x: 80, y: 10 }, to: { x: 80, y: 110 } },
];

const I_STROKES: StrokeDef[] = [
  { from: { x: 30, y: 10 }, to: { x: 70, y: 10 } },
  { from: { x: 50, y: 10 }, to: { x: 50, y: 110 } },
  { from: { x: 30, y: 110 }, to: { x: 70, y: 110 } },
];

const J_STROKES: StrokeDef[] = [
  { from: { x: 30, y: 10 }, to: { x: 80, y: 10 } },
  { from: { x: 60, y: 10 }, to: { x: 60, y: 75 } },
  ...arcStrokes(42, 80, 20, 28, 0, Math.PI * 0.75, 12),
];
const J_DOTS: Point[] = dedup([
  { x: 30, y: 10 }, { x: 50, y: 10 }, { x: 70, y: 10 }, { x: 80, y: 10 },
  { x: 60, y: 10 }, { x: 60, y: 30 }, { x: 60, y: 50 }, { x: 60, y: 70 },
  ...arc(42, 88, 20, 22, 0, Math.PI * 0.7, 5),
]);

const K_STROKES: StrokeDef[] = [
  { from: { x: 25, y: 10 }, to: { x: 25, y: 110 } },
  { from: { x: 80, y: 10 }, to: { x: 25, y: 60 } },
  { from: { x: 25, y: 60 }, to: { x: 80, y: 110 } },
];

const L_STROKES: StrokeDef[] = [
  { from: { x: 25, y: 10 }, to: { x: 25, y: 110 } },
  { from: { x: 25, y: 110 }, to: { x: 75, y: 110 } },
];

const M_STROKES: StrokeDef[] = [
  { from: { x: 10, y: 110 }, to: { x: 10, y: 10 } },
  { from: { x: 10, y: 10 }, to: { x: 50, y: 70 } },
  { from: { x: 50, y: 70 }, to: { x: 90, y: 10 } },
  { from: { x: 90, y: 10 }, to: { x: 90, y: 110 } },
];

const N_STROKES: StrokeDef[] = [
  { from: { x: 20, y: 110 }, to: { x: 20, y: 10 } },
  { from: { x: 20, y: 10 }, to: { x: 80, y: 110 } },
  { from: { x: 80, y: 110 }, to: { x: 80, y: 10 } },
];

const O_STROKES: StrokeDef[] = arcStrokes(50, 60, 38, 48, -Math.PI / 2, Math.PI * 1.5, 24);
const O_DOTS: Point[] = arc(50, 60, 38, 48, -Math.PI / 2, Math.PI * 1.5, 14);

const P_STROKES: StrokeDef[] = [
  { from: { x: 25, y: 10 }, to: { x: 25, y: 110 } },
  { from: { x: 25, y: 10 }, to: { x: 55, y: 10 } },
  ...arcStrokes(55, 35, 26, 25, -Math.PI / 2, Math.PI / 2, 12),
  { from: { x: 55, y: 60 }, to: { x: 25, y: 60 } },
];
const P_DOTS: Point[] = dedup([
  { x: 25, y: 10 }, { x: 25, y: 30 }, { x: 25, y: 50 }, { x: 25, y: 70 }, { x: 25, y: 90 }, { x: 25, y: 110 },
  { x: 42, y: 10 }, { x: 60, y: 10 },
  ...arc(52, 35, 26, 25, -Math.PI / 2, Math.PI / 2, 6),
  { x: 42, y: 60 }, { x: 60, y: 60 },
]);

const Q_STROKES: StrokeDef[] = [
  ...arcStrokes(50, 55, 36, 42, -Math.PI / 2, Math.PI * 1.5, 24),
  { from: { x: 60, y: 85 }, to: { x: 85, y: 115 } },
];
const Q_DOTS: Point[] = dedup([
  ...arc(50, 55, 36, 42, -Math.PI / 2, Math.PI * 1.5, 12),
  { x: 65, y: 90 }, { x: 75, y: 102 }, { x: 85, y: 115 },
]);

const R_STROKES: StrokeDef[] = [
  { from: { x: 25, y: 10 }, to: { x: 25, y: 110 } },
  { from: { x: 25, y: 10 }, to: { x: 55, y: 10 } },
  ...arcStrokes(55, 35, 26, 25, -Math.PI / 2, Math.PI / 2, 12),
  { from: { x: 55, y: 60 }, to: { x: 25, y: 60 } },
  { from: { x: 45, y: 60 }, to: { x: 80, y: 110 } },
];
const R_DOTS: Point[] = dedup([
  { x: 25, y: 10 }, { x: 25, y: 30 }, { x: 25, y: 50 }, { x: 25, y: 70 }, { x: 25, y: 90 }, { x: 25, y: 110 },
  { x: 42, y: 10 }, { x: 60, y: 10 },
  ...arc(52, 35, 26, 25, -Math.PI / 2, Math.PI / 2, 6),
  { x: 42, y: 60 },
  { x: 55, y: 75 }, { x: 65, y: 90 }, { x: 75, y: 105 }, { x: 80, y: 110 },
]);

// Two separate ellipse arcs with different sweep angles did not share endpoints → looked like two
// mismatched “C” hooks. Use one continuous spine in the 100×120 box for a readable S.
const S_STROKES: StrokeDef[] = polylineToStrokes([
  { x: 72, y: 24 },
  { x: 54, y: 20 },
  { x: 40, y: 26 },
  { x: 32, y: 36 },
  { x: 30, y: 48 },
  { x: 36, y: 58 },
  { x: 48, y: 64 },
  { x: 58, y: 68 },
  { x: 68, y: 74 },
  { x: 72, y: 84 },
  { x: 68, y: 96 },
  { x: 56, y: 104 },
  { x: 40, y: 108 },
  { x: 28, y: 102 },
  { x: 24, y: 90 },
  { x: 30, y: 78 },
]);
const S_DOTS: Point[] = makeDots(S_STROKES, 15, 10);

const T_STROKES: StrokeDef[] = [
  { from: { x: 15, y: 10 }, to: { x: 85, y: 10 } },
  { from: { x: 50, y: 10 }, to: { x: 50, y: 110 } },
];

const U_STROKES: StrokeDef[] = [
  { from: { x: 20, y: 10 }, to: { x: 20, y: 75 } },
  ...arcStrokes(50, 75, 30, 35, Math.PI, 0, 14),
  { from: { x: 80, y: 75 }, to: { x: 80, y: 10 } },
];
const U_DOTS: Point[] = dedup([
  { x: 20, y: 10 }, { x: 20, y: 30 }, { x: 20, y: 50 }, { x: 20, y: 70 },
  ...arc(50, 80, 30, 30, Math.PI, 0, 6),
  { x: 80, y: 70 }, { x: 80, y: 50 }, { x: 80, y: 30 }, { x: 80, y: 10 },
]);

const V_STROKES: StrokeDef[] = [
  { from: { x: 10, y: 10 }, to: { x: 50, y: 110 } },
  { from: { x: 50, y: 110 }, to: { x: 90, y: 10 } },
];

const W_STROKES: StrokeDef[] = [
  { from: { x: 5, y: 10 }, to: { x: 20, y: 110 } },
  { from: { x: 20, y: 110 }, to: { x: 50, y: 50 } },
  { from: { x: 50, y: 50 }, to: { x: 80, y: 110 } },
  { from: { x: 80, y: 110 }, to: { x: 95, y: 10 } },
];

const X_STROKES: StrokeDef[] = [
  { from: { x: 15, y: 10 }, to: { x: 85, y: 110 } },
  { from: { x: 85, y: 10 }, to: { x: 15, y: 110 } },
];

const Y_STROKES: StrokeDef[] = [
  { from: { x: 10, y: 10 }, to: { x: 50, y: 55 } },
  { from: { x: 90, y: 10 }, to: { x: 50, y: 55 } },
  { from: { x: 50, y: 55 }, to: { x: 50, y: 110 } },
];

const Z_STROKES: StrokeDef[] = [
  { from: { x: 15, y: 10 }, to: { x: 85, y: 10 } },
  { from: { x: 85, y: 10 }, to: { x: 15, y: 110 } },
  { from: { x: 15, y: 110 }, to: { x: 85, y: 110 } },
];

interface RawDef { letter: string; strokes: StrokeDef[]; dots?: Point[] }

const DEFS: RawDef[] = [
  { letter: 'A', strokes: A_STROKES },
  { letter: 'B', strokes: B_STROKES, dots: B_DOTS },
  { letter: 'C', strokes: C_STROKES, dots: C_DOTS },
  { letter: 'D', strokes: D_STROKES, dots: D_DOTS },
  { letter: 'E', strokes: E_STROKES },
  { letter: 'F', strokes: F_STROKES },
  { letter: 'G', strokes: G_STROKES, dots: G_DOTS },
  { letter: 'H', strokes: H_STROKES },
  { letter: 'I', strokes: I_STROKES },
  { letter: 'J', strokes: J_STROKES, dots: J_DOTS },
  { letter: 'K', strokes: K_STROKES },
  { letter: 'L', strokes: L_STROKES },
  { letter: 'M', strokes: M_STROKES },
  { letter: 'N', strokes: N_STROKES },
  { letter: 'O', strokes: O_STROKES, dots: O_DOTS },
  { letter: 'P', strokes: P_STROKES, dots: P_DOTS },
  { letter: 'Q', strokes: Q_STROKES, dots: Q_DOTS },
  { letter: 'R', strokes: R_STROKES, dots: R_DOTS },
  { letter: 'S', strokes: S_STROKES, dots: S_DOTS },
  { letter: 'T', strokes: T_STROKES },
  { letter: 'U', strokes: U_STROKES, dots: U_DOTS },
  { letter: 'V', strokes: V_STROKES },
  { letter: 'W', strokes: W_STROKES },
  { letter: 'X', strokes: X_STROKES },
  { letter: 'Y', strokes: Y_STROKES },
  { letter: 'Z', strokes: Z_STROKES },
];

const ALL: LetterDef[] = DEFS.map(d => ({
  letter: d.letter,
  strokes: d.strokes,
  dots: d.dots ?? makeDots(d.strokes),
}));

export const ALPHABET: LetterDef[] = ALL;
export const ALPHABET_NAMES = ALL.map((l) => l.letter);

export function scaleDots(dots: Point[], cW: number, cH: number): Point[] {
  const s = Math.min(cW / 100, cH / 120) * 0.75;
  const ox = (cW - 100 * s) / 2;
  const oy = (cH - 120 * s) / 2;
  return dots.map((p) => ({ x: ox + p.x * s, y: oy + p.y * s }));
}

export function scaleStrokes(strokes: StrokeDef[], cW: number, cH: number): StrokeDef[] {
  const s = Math.min(cW / 100, cH / 120) * 0.75;
  const ox = (cW - 100 * s) / 2;
  const oy = (cH - 120 * s) / 2;
  return strokes.map((st) => ({
    from: { x: ox + st.from.x * s, y: oy + st.from.y * s },
    to: { x: ox + st.to.x * s, y: oy + st.to.y * s },
  }));
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
