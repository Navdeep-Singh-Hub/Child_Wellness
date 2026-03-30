/**
 * Straight-line capital letters: I, L, T, H, E, F
 * Each letter defined in a 100×120 unit box with:
 *  - dots: tracing points
 *  - segments: line pieces for the "Build Letter" game
 *  - strokes: ordered SVG-style stroke sequences for animated drawing
 */

export interface Point {
  x: number;
  y: number;
}

export interface Segment {
  from: Point;
  to: Point;
  id: string;
}

export interface LetterDef {
  letter: string;
  dots: Point[];
  segments: Segment[];
  strokes: { from: Point; to: Point }[];
}

const I_DEF: LetterDef = {
  letter: 'I',
  dots: [
    { x: 30, y: 10 }, { x: 50, y: 10 }, { x: 70, y: 10 },
    { x: 50, y: 40 }, { x: 50, y: 70 }, { x: 50, y: 100 },
    { x: 30, y: 110 }, { x: 50, y: 110 }, { x: 70, y: 110 },
  ],
  segments: [
    { from: { x: 30, y: 10 }, to: { x: 70, y: 10 }, id: 'I-top' },
    { from: { x: 50, y: 10 }, to: { x: 50, y: 110 }, id: 'I-mid' },
    { from: { x: 30, y: 110 }, to: { x: 70, y: 110 }, id: 'I-bot' },
  ],
  strokes: [
    { from: { x: 30, y: 10 }, to: { x: 70, y: 10 } },
    { from: { x: 50, y: 10 }, to: { x: 50, y: 110 } },
    { from: { x: 30, y: 110 }, to: { x: 70, y: 110 } },
  ],
};

const L_DEF: LetterDef = {
  letter: 'L',
  dots: [
    { x: 25, y: 10 }, { x: 25, y: 40 }, { x: 25, y: 70 },
    { x: 25, y: 100 }, { x: 25, y: 110 },
    { x: 50, y: 110 }, { x: 75, y: 110 },
  ],
  segments: [
    { from: { x: 25, y: 10 }, to: { x: 25, y: 110 }, id: 'L-vert' },
    { from: { x: 25, y: 110 }, to: { x: 75, y: 110 }, id: 'L-horiz' },
  ],
  strokes: [
    { from: { x: 25, y: 10 }, to: { x: 25, y: 110 } },
    { from: { x: 25, y: 110 }, to: { x: 75, y: 110 } },
  ],
};

const T_DEF: LetterDef = {
  letter: 'T',
  dots: [
    { x: 15, y: 10 }, { x: 35, y: 10 }, { x: 50, y: 10 }, { x: 65, y: 10 }, { x: 85, y: 10 },
    { x: 50, y: 35 }, { x: 50, y: 60 }, { x: 50, y: 85 }, { x: 50, y: 110 },
  ],
  segments: [
    { from: { x: 15, y: 10 }, to: { x: 85, y: 10 }, id: 'T-top' },
    { from: { x: 50, y: 10 }, to: { x: 50, y: 110 }, id: 'T-stem' },
  ],
  strokes: [
    { from: { x: 15, y: 10 }, to: { x: 85, y: 10 } },
    { from: { x: 50, y: 10 }, to: { x: 50, y: 110 } },
  ],
};

const H_DEF: LetterDef = {
  letter: 'H',
  dots: [
    { x: 20, y: 10 }, { x: 20, y: 40 }, { x: 20, y: 60 },
    { x: 20, y: 90 }, { x: 20, y: 110 },
    { x: 50, y: 60 },
    { x: 80, y: 60 },
    { x: 80, y: 10 }, { x: 80, y: 40 },
    { x: 80, y: 90 }, { x: 80, y: 110 },
  ],
  segments: [
    { from: { x: 20, y: 10 }, to: { x: 20, y: 110 }, id: 'H-left' },
    { from: { x: 20, y: 60 }, to: { x: 80, y: 60 }, id: 'H-mid' },
    { from: { x: 80, y: 10 }, to: { x: 80, y: 110 }, id: 'H-right' },
  ],
  strokes: [
    { from: { x: 20, y: 10 }, to: { x: 20, y: 110 } },
    { from: { x: 20, y: 60 }, to: { x: 80, y: 60 } },
    { from: { x: 80, y: 10 }, to: { x: 80, y: 110 } },
  ],
};

const E_DEF: LetterDef = {
  letter: 'E',
  dots: [
    { x: 75, y: 10 }, { x: 50, y: 10 }, { x: 25, y: 10 },
    { x: 25, y: 40 }, { x: 25, y: 60 },
    { x: 50, y: 60 }, { x: 65, y: 60 },
    { x: 25, y: 80 }, { x: 25, y: 110 },
    { x: 50, y: 110 }, { x: 75, y: 110 },
  ],
  segments: [
    { from: { x: 25, y: 10 }, to: { x: 75, y: 10 }, id: 'E-top' },
    { from: { x: 25, y: 10 }, to: { x: 25, y: 110 }, id: 'E-vert' },
    { from: { x: 25, y: 60 }, to: { x: 65, y: 60 }, id: 'E-mid' },
    { from: { x: 25, y: 110 }, to: { x: 75, y: 110 }, id: 'E-bot' },
  ],
  strokes: [
    { from: { x: 25, y: 10 }, to: { x: 75, y: 10 } },
    { from: { x: 25, y: 10 }, to: { x: 25, y: 110 } },
    { from: { x: 25, y: 60 }, to: { x: 65, y: 60 } },
    { from: { x: 25, y: 110 }, to: { x: 75, y: 110 } },
  ],
};

const F_DEF: LetterDef = {
  letter: 'F',
  dots: [
    { x: 75, y: 10 }, { x: 50, y: 10 }, { x: 25, y: 10 },
    { x: 25, y: 40 }, { x: 25, y: 60 },
    { x: 50, y: 60 }, { x: 65, y: 60 },
    { x: 25, y: 80 }, { x: 25, y: 110 },
  ],
  segments: [
    { from: { x: 25, y: 10 }, to: { x: 75, y: 10 }, id: 'F-top' },
    { from: { x: 25, y: 10 }, to: { x: 25, y: 110 }, id: 'F-vert' },
    { from: { x: 25, y: 60 }, to: { x: 65, y: 60 }, id: 'F-mid' },
  ],
  strokes: [
    { from: { x: 25, y: 10 }, to: { x: 75, y: 10 } },
    { from: { x: 25, y: 10 }, to: { x: 25, y: 110 } },
    { from: { x: 25, y: 60 }, to: { x: 65, y: 60 } },
  ],
};

export const LETTERS: LetterDef[] = [I_DEF, L_DEF, T_DEF, H_DEF, E_DEF, F_DEF];
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
