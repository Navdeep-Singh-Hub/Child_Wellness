import { Audio as ExpoAudio } from 'expo-av';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export const useTraceSound = (uri: string) => {
  const ref = useRef<ExpoAudio.Sound | null>(null);
  useEffect(() => () => { ref.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      try {
        if (!ref.current) {
          const { sound } = await ExpoAudio.Sound.createAsync({ uri }, { volume: 0.55 });
          ref.current = sound;
        }
        await ref.current.replayAsync();
      } catch { /* noop */ }
    })();
  }, [uri]);
};

export const distanceToBezier = (
  px: number, py: number,
  x1: number, y1: number, cx1: number, cy1: number, cx2: number, cy2: number, x2: number, y2: number,
) => {
  let minDist = Infinity;
  let bestT = 0;
  for (let t = 0; t <= 1; t += 0.01) {
    const mt = 1 - t;
    const x = mt ** 3 * x1 + 3 * mt ** 2 * t * cx1 + 3 * mt * t ** 2 * cx2 + t ** 3 * x2;
    const y = mt ** 3 * y1 + 3 * mt ** 2 * t * cy1 + 3 * mt * t ** 2 * cy2 + t ** 3 * y2;
    const dist = Math.hypot(px - x, py - y);
    if (dist < minDist) { minDist = dist; bestT = t; }
  }
  return { dist: minDist, t: bestT };
};

export const distanceToArc = (
  px: number, py: number,
  centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number,
) => {
  const angle = Math.atan2(py - centerY, px - centerX);
  const norm = (a: number) => (a + 2 * Math.PI) % (2 * Math.PI);
  const nA = norm(angle);
  const nS = norm(startAngle);
  const nE = norm(endAngle);
  const inArc = nS < nE ? nA >= nS && nA <= nE : nA >= nS || nA <= nE;
  const distFromCenter = Math.hypot(px - centerX, py - centerY);
  const distFromArc = Math.abs(distFromCenter - radius);
  if (inArc) return distFromArc;
  const sx = centerX + radius * Math.cos(startAngle);
  const sy = centerY + radius * Math.sin(startAngle);
  const ex = centerX + radius * Math.cos(endAngle);
  const ey = centerY + radius * Math.sin(endAngle);
  return Math.min(distFromArc, Math.hypot(px - sx, py - sy), Math.hypot(px - ex, py - ey));
};

export const arcProgress = (
  px: number, py: number,
  centerX: number, centerY: number, startAngle: number, endAngle: number,
) => {
  const angle = Math.atan2(py - centerY, px - centerX);
  const norm = (a: number) => (a + 2 * Math.PI) % (2 * Math.PI);
  const nA = norm(angle);
  const nS = norm(startAngle);
  const nE = norm(endAngle);
  if (nS < nE) return Math.min(1, Math.max(0, (nA - nS) / (nE - nS)));
  const span = (nE - nS + 2 * Math.PI) % (2 * Math.PI);
  const prog = ((nA - nS + 2 * Math.PI) % (2 * Math.PI)) / span;
  return Math.min(1, Math.max(0, prog));
};

export const buildBezierPaths = (
  sx: number, sy: number, c1x: number, c1y: number, c2x: number, c2y: number, ex: number, ey: number, progress: number,
) => {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const mt = 1 - t;
    pts.push({
      x: mt ** 3 * sx + 3 * mt ** 2 * t * c1x + 3 * mt * t ** 2 * c2x + t ** 3 * ex,
      y: mt ** 3 * sy + 3 * mt ** 2 * t * c1y + 3 * mt * t ** 2 * c2y + t ** 3 * ey,
    });
  }
  let full = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) full += ` L ${pts[i].x} ${pts[i].y}`;
  if (progress <= 0) return { full, progressPath: '' };
  if (progress >= 0.99) return { full, progressPath: full };
  const seg = Math.floor(progress * (pts.length - 1));
  const frac = progress * (pts.length - 1) - seg;
  let prog = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i <= seg; i++) prog += ` L ${pts[i].x} ${pts[i].y}`;
  if (frac > 0 && seg < pts.length - 1) {
    const a = pts[seg];
    const b = pts[seg + 1];
    prog += ` L ${a.x + (b.x - a.x) * frac} ${a.y + (b.y - a.y) * frac}`;
  }
  return { full, progressPath: prog };
};

export const buildArcPaths = (
  cx: number, cy: number, r: number, sa: number, ea: number, progress: number,
) => {
  const sx = cx + r * Math.cos(sa);
  const sy = cy + r * Math.sin(sa);
  const ex = cx + r * Math.cos(ea);
  const ey = cy + r * Math.sin(ea);
  const full = `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`;
  if (progress <= 0) return { full, progressPath: '' };
  const ca = sa + (ea - sa) * Math.min(1, progress);
  const px = cx + r * Math.cos(ca);
  const py = cy + r * Math.sin(ca);
  return { full, progressPath: `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${px} ${py}` };
};
