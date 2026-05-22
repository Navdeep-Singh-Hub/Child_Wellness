export type MouthLandmarksLike = {
  upperLip?: Array<{ x: number; y: number }>;
  lowerLip?: Array<{ x: number; y: number }>;
  mouthLeft?: { x: number; y: number } | null;
  mouthRight?: { x: number; y: number } | null;
};

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function meanPoint(points: Array<{ x: number; y: number }>) {
  if (!points.length) return { x: 0, y: 0 };
  let sx = 0;
  let sy = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
  }
  return { x: sx / points.length, y: sy / points.length };
}

export function calculateRoundness(landmarks: MouthLandmarksLike | null | undefined): number {
  if (!landmarks?.mouthLeft || !landmarks?.mouthRight) return 0;
  const upper = meanPoint(landmarks.upperLip || []);
  const lower = meanPoint(landmarks.lowerLip || []);
  const width = dist(landmarks.mouthLeft, landmarks.mouthRight);
  const height = dist(upper, lower);
  return height / Math.max(1, width);
}

/** Wide open “A” — web MAR scale */
export function isWideOpenA(ratio: number, isOpen: boolean) {
  return isOpen && ratio >= 0.14;
}

/** Spread smile “E” */
export function isSmileEee(
  smileAmount: number | undefined,
  ratio: number,
  isOpen: boolean,
  cheekExpansion?: number,
) {
  if (typeof smileAmount === 'number') return smileAmount >= 0.4;
  if (typeof cheekExpansion === 'number' && cheekExpansion >= 0.35) return true;
  return !isOpen && ratio >= 0.02 && ratio <= 0.11;
}

/** Round “O” */
export function isRoundOoo(
  landmarks: MouthLandmarksLike | null | undefined,
  ratio: number,
  roundness?: number,
) {
  const r = roundness ?? calculateRoundness(landmarks);
  return r >= 0.62 && ratio >= 0.025 && ratio <= 0.14;
}
