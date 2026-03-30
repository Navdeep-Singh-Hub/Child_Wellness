/**
 * Slant + curve capital letters: A, V, W, X, Y, Z, N, C, O, Q, U, S, G, J
 * Each in a 100×120 unit box with dots (tracing), segments (build game), strokes (animation).
 */

export interface Point { x: number; y: number }
export interface Segment { from: Point; to: Point; id: string }
export interface LetterDef {
  letter: string;
  dots: Point[];
  segments: Segment[];
  strokes: { from: Point; to: Point }[];
}

const A: LetterDef = {
  letter: 'A',
  dots: [
    { x: 10, y: 110 }, { x: 20, y: 85 }, { x: 30, y: 60 }, { x: 40, y: 35 }, { x: 50, y: 10 },
    { x: 60, y: 35 }, { x: 70, y: 60 }, { x: 80, y: 85 }, { x: 90, y: 110 },
    { x: 30, y: 75 }, { x: 50, y: 75 }, { x: 70, y: 75 },
  ],
  segments: [
    { from: { x: 10, y: 110 }, to: { x: 50, y: 10 }, id: 'A-left' },
    { from: { x: 50, y: 10 }, to: { x: 90, y: 110 }, id: 'A-right' },
    { from: { x: 30, y: 75 }, to: { x: 70, y: 75 }, id: 'A-bar' },
  ],
  strokes: [
    { from: { x: 10, y: 110 }, to: { x: 50, y: 10 } },
    { from: { x: 50, y: 10 }, to: { x: 90, y: 110 } },
    { from: { x: 30, y: 75 }, to: { x: 70, y: 75 } },
  ],
};

const V: LetterDef = {
  letter: 'V',
  dots: [
    { x: 10, y: 10 }, { x: 20, y: 35 }, { x: 30, y: 60 }, { x: 40, y: 85 }, { x: 50, y: 110 },
    { x: 60, y: 85 }, { x: 70, y: 60 }, { x: 80, y: 35 }, { x: 90, y: 10 },
  ],
  segments: [
    { from: { x: 10, y: 10 }, to: { x: 50, y: 110 }, id: 'V-left' },
    { from: { x: 50, y: 110 }, to: { x: 90, y: 10 }, id: 'V-right' },
  ],
  strokes: [
    { from: { x: 10, y: 10 }, to: { x: 50, y: 110 } },
    { from: { x: 50, y: 110 }, to: { x: 90, y: 10 } },
  ],
};

const W: LetterDef = {
  letter: 'W',
  dots: [
    { x: 5, y: 10 }, { x: 12, y: 60 }, { x: 20, y: 110 },
    { x: 35, y: 80 }, { x: 50, y: 50 },
    { x: 65, y: 80 }, { x: 80, y: 110 },
    { x: 87, y: 60 }, { x: 95, y: 10 },
  ],
  segments: [
    { from: { x: 5, y: 10 }, to: { x: 20, y: 110 }, id: 'W-1' },
    { from: { x: 20, y: 110 }, to: { x: 50, y: 50 }, id: 'W-2' },
    { from: { x: 50, y: 50 }, to: { x: 80, y: 110 }, id: 'W-3' },
    { from: { x: 80, y: 110 }, to: { x: 95, y: 10 }, id: 'W-4' },
  ],
  strokes: [
    { from: { x: 5, y: 10 }, to: { x: 20, y: 110 } },
    { from: { x: 20, y: 110 }, to: { x: 50, y: 50 } },
    { from: { x: 50, y: 50 }, to: { x: 80, y: 110 } },
    { from: { x: 80, y: 110 }, to: { x: 95, y: 10 } },
  ],
};

const X: LetterDef = {
  letter: 'X',
  dots: [
    { x: 15, y: 10 }, { x: 32, y: 35 }, { x: 50, y: 60 }, { x: 68, y: 85 }, { x: 85, y: 110 },
    { x: 85, y: 10 }, { x: 68, y: 35 }, { x: 32, y: 85 }, { x: 15, y: 110 },
  ],
  segments: [
    { from: { x: 15, y: 10 }, to: { x: 85, y: 110 }, id: 'X-fwd' },
    { from: { x: 85, y: 10 }, to: { x: 15, y: 110 }, id: 'X-bck' },
  ],
  strokes: [
    { from: { x: 15, y: 10 }, to: { x: 85, y: 110 } },
    { from: { x: 85, y: 10 }, to: { x: 15, y: 110 } },
  ],
};

const Y: LetterDef = {
  letter: 'Y',
  dots: [
    { x: 10, y: 10 }, { x: 30, y: 32 }, { x: 50, y: 55 },
    { x: 90, y: 10 }, { x: 70, y: 32 },
    { x: 50, y: 75 }, { x: 50, y: 95 }, { x: 50, y: 110 },
  ],
  segments: [
    { from: { x: 10, y: 10 }, to: { x: 50, y: 55 }, id: 'Y-left' },
    { from: { x: 90, y: 10 }, to: { x: 50, y: 55 }, id: 'Y-right' },
    { from: { x: 50, y: 55 }, to: { x: 50, y: 110 }, id: 'Y-stem' },
  ],
  strokes: [
    { from: { x: 10, y: 10 }, to: { x: 50, y: 55 } },
    { from: { x: 90, y: 10 }, to: { x: 50, y: 55 } },
    { from: { x: 50, y: 55 }, to: { x: 50, y: 110 } },
  ],
};

const Z: LetterDef = {
  letter: 'Z',
  dots: [
    { x: 15, y: 10 }, { x: 50, y: 10 }, { x: 85, y: 10 },
    { x: 73, y: 35 }, { x: 50, y: 60 }, { x: 27, y: 85 },
    { x: 15, y: 110 }, { x: 50, y: 110 }, { x: 85, y: 110 },
  ],
  segments: [
    { from: { x: 15, y: 10 }, to: { x: 85, y: 10 }, id: 'Z-top' },
    { from: { x: 85, y: 10 }, to: { x: 15, y: 110 }, id: 'Z-diag' },
    { from: { x: 15, y: 110 }, to: { x: 85, y: 110 }, id: 'Z-bot' },
  ],
  strokes: [
    { from: { x: 15, y: 10 }, to: { x: 85, y: 10 } },
    { from: { x: 85, y: 10 }, to: { x: 15, y: 110 } },
    { from: { x: 15, y: 110 }, to: { x: 85, y: 110 } },
  ],
};

const N: LetterDef = {
  letter: 'N',
  dots: [
    { x: 20, y: 110 }, { x: 20, y: 60 }, { x: 20, y: 10 },
    { x: 50, y: 60 },
    { x: 80, y: 110 }, { x: 80, y: 60 }, { x: 80, y: 10 },
  ],
  segments: [
    { from: { x: 20, y: 110 }, to: { x: 20, y: 10 }, id: 'N-left' },
    { from: { x: 20, y: 10 }, to: { x: 80, y: 110 }, id: 'N-diag' },
    { from: { x: 80, y: 110 }, to: { x: 80, y: 10 }, id: 'N-right' },
  ],
  strokes: [
    { from: { x: 20, y: 110 }, to: { x: 20, y: 10 } },
    { from: { x: 20, y: 10 }, to: { x: 80, y: 110 } },
    { from: { x: 80, y: 110 }, to: { x: 80, y: 10 } },
  ],
};

function arcDots(cx: number, cy: number, rx: number, ry: number, startAngle: number, endAngle: number, count: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0;
    const angle = startAngle + t * (endAngle - startAngle);
    pts.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) });
  }
  return pts;
}

function polylineStrokesFromVerts(pts: Point[]): { from: Point; to: Point }[] {
  const s: { from: Point; to: Point }[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    s.push({ from: pts[i], to: pts[i + 1] });
  }
  return s;
}

function dotsAlongPolyline(vertices: Point[], subdivPerEdge: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < vertices.length - 1; i++) {
    const a = vertices[i];
    const b = vertices[i + 1];
    for (let k = 0; k <= subdivPerEdge; k++) {
      const t = k / subdivPerEdge;
      out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
    }
  }
  return out;
}

/** Matches alphabetData.ts — smooth S spine (old version used two mismatched arc chords). */
const S_VERTICES: Point[] = [
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
];

const C: LetterDef = {
  letter: 'C',
  dots: arcDots(55, 60, 38, 48, -Math.PI / 4, -7 * Math.PI / 4, 10),
  segments: [
    { from: arcDots(55, 60, 38, 48, -Math.PI / 4, -Math.PI / 4, 1)[0], to: arcDots(55, 60, 38, 48, -Math.PI, -Math.PI, 1)[0], id: 'C-top' },
    { from: arcDots(55, 60, 38, 48, -Math.PI, -Math.PI, 1)[0], to: arcDots(55, 60, 38, 48, -7 * Math.PI / 4, -7 * Math.PI / 4, 1)[0], id: 'C-bot' },
  ],
  strokes: [
    { from: arcDots(55, 60, 38, 48, -Math.PI / 4, -Math.PI / 4, 1)[0], to: arcDots(55, 60, 38, 48, -7 * Math.PI / 4, -7 * Math.PI / 4, 1)[0] },
  ],
};

const fullOval = (cx: number, cy: number, rx: number, ry: number, count: number) =>
  arcDots(cx, cy, rx, ry, -Math.PI / 2, Math.PI * 1.5, count);

const O: LetterDef = {
  letter: 'O',
  dots: fullOval(50, 60, 38, 48, 10),
  segments: [
    { from: { x: 50, y: 12 }, to: { x: 12, y: 60 }, id: 'O-tl' },
    { from: { x: 12, y: 60 }, to: { x: 50, y: 108 }, id: 'O-bl' },
    { from: { x: 50, y: 108 }, to: { x: 88, y: 60 }, id: 'O-br' },
    { from: { x: 88, y: 60 }, to: { x: 50, y: 12 }, id: 'O-tr' },
  ],
  strokes: [
    { from: { x: 50, y: 12 }, to: { x: 12, y: 60 } },
    { from: { x: 12, y: 60 }, to: { x: 50, y: 108 } },
    { from: { x: 50, y: 108 }, to: { x: 88, y: 60 } },
    { from: { x: 88, y: 60 }, to: { x: 50, y: 12 } },
  ],
};

const Q: LetterDef = {
  letter: 'Q',
  dots: [...fullOval(50, 55, 36, 42, 8), { x: 65, y: 90 }, { x: 85, y: 115 }],
  segments: [
    ...O.segments.map((s) => ({ ...s, id: s.id.replace('O-', 'Q-') })),
    { from: { x: 60, y: 85 }, to: { x: 85, y: 115 }, id: 'Q-tail' },
  ],
  strokes: [
    ...O.strokes,
    { from: { x: 60, y: 85 }, to: { x: 85, y: 115 } },
  ],
};

const U: LetterDef = {
  letter: 'U',
  dots: [
    { x: 20, y: 10 }, { x: 20, y: 50 }, { x: 20, y: 80 },
    { x: 35, y: 105 }, { x: 50, y: 110 }, { x: 65, y: 105 },
    { x: 80, y: 80 }, { x: 80, y: 50 }, { x: 80, y: 10 },
  ],
  segments: [
    { from: { x: 20, y: 10 }, to: { x: 20, y: 80 }, id: 'U-left' },
    { from: { x: 20, y: 80 }, to: { x: 80, y: 80 }, id: 'U-curve' },
    { from: { x: 80, y: 80 }, to: { x: 80, y: 10 }, id: 'U-right' },
  ],
  strokes: [
    { from: { x: 20, y: 10 }, to: { x: 20, y: 80 } },
    { from: { x: 20, y: 80 }, to: { x: 50, y: 110 } },
    { from: { x: 50, y: 110 }, to: { x: 80, y: 80 } },
    { from: { x: 80, y: 80 }, to: { x: 80, y: 10 } },
  ],
};

const S: LetterDef = {
  letter: 'S',
  dots: dotsAlongPolyline(S_VERTICES, 2),
  segments: polylineStrokesFromVerts(S_VERTICES).map((seg, i) => ({ ...seg, id: `S-${i}` })),
  strokes: polylineStrokesFromVerts(S_VERTICES),
};

const G: LetterDef = {
  letter: 'G',
  dots: [
    ...arcDots(55, 60, 38, 48, -Math.PI / 4, -7 * Math.PI / 4, 10),
    { x: 82, y: 80 }, { x: 82, y: 60 },
    { x: 70, y: 60 }, { x: 55, y: 60 },
  ],
  segments: [
    ...C.segments.map((s) => ({ ...s, id: s.id.replace('C-', 'G-') })),
    { from: { x: 82, y: 94 }, to: { x: 82, y: 60 }, id: 'G-vert' },
    { from: { x: 82, y: 60 }, to: { x: 55, y: 60 }, id: 'G-bar' },
  ],
  strokes: [
    ...C.strokes,
    { from: { x: 82, y: 94 }, to: { x: 82, y: 60 } },
    { from: { x: 82, y: 60 }, to: { x: 55, y: 60 } },
  ],
};

const J: LetterDef = {
  letter: 'J',
  dots: [
    { x: 30, y: 10 }, { x: 60, y: 10 }, { x: 80, y: 10 },
    { x: 60, y: 40 }, { x: 60, y: 70 },
    { x: 55, y: 95 }, { x: 40, y: 108 }, { x: 25, y: 100 },
  ],
  segments: [
    { from: { x: 30, y: 10 }, to: { x: 80, y: 10 }, id: 'J-top' },
    { from: { x: 60, y: 10 }, to: { x: 60, y: 80 }, id: 'J-stem' },
    { from: { x: 60, y: 80 }, to: { x: 25, y: 100 }, id: 'J-hook' },
  ],
  strokes: [
    { from: { x: 30, y: 10 }, to: { x: 80, y: 10 } },
    { from: { x: 60, y: 10 }, to: { x: 60, y: 80 } },
    { from: { x: 60, y: 80 }, to: { x: 40, y: 108 } },
    { from: { x: 40, y: 108 }, to: { x: 25, y: 100 } },
  ],
};

export const LETTERS: LetterDef[] = [A, V, W, X, Y, Z, N, C, O, Q, U, S, G, J];
export const LETTER_NAMES = LETTERS.map((l) => l.letter);

export function scaleDots(dots: Point[], boxW: number, boxH: number, cW: number, cH: number): Point[] {
  const s = Math.min(cW / boxW, cH / boxH) * 0.75;
  const ox = (cW - boxW * s) / 2;
  const oy = (cH - boxH * s) / 2;
  return dots.map((p) => ({ x: ox + p.x * s, y: oy + p.y * s }));
}

export function scaleSegments(segs: Segment[], boxW: number, boxH: number, cW: number, cH: number): Segment[] {
  const s = Math.min(cW / boxW, cH / boxH) * 0.75;
  const ox = (cW - boxW * s) / 2;
  const oy = (cH - boxH * s) / 2;
  return segs.map((seg) => ({
    from: { x: ox + seg.from.x * s, y: oy + seg.from.y * s },
    to: { x: ox + seg.to.x * s, y: oy + seg.to.y * s },
    id: seg.id,
  }));
}

export function scaleStrokes(strokes: { from: Point; to: Point }[], boxW: number, boxH: number, cW: number, cH: number) {
  const s = Math.min(cW / boxW, cH / boxH) * 0.75;
  const ox = (cW - boxW * s) / 2;
  const oy = (cH - boxH * s) / 2;
  return strokes.map((st) => ({
    from: { x: ox + st.from.x * s, y: oy + st.from.y * s },
    to: { x: ox + st.to.x * s, y: oy + st.to.y * s },
  }));
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
