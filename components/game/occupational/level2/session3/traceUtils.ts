import { Audio as ExpoAudio } from 'expo-av';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export type Point = { x: number; y: number };

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

const distToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
};

export const distanceToPolyline = (px: number, py: number, points: Point[]) => {
  let min = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    min = Math.min(min, distToSegment(px, py, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y));
  }
  return min;
};

export const progressOnPolyline = (px: number, py: number, points: Point[]) => {
  if (points.length < 2) return 0;
  const segLens: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    segLens.push(len);
    total += len;
  }
  let bestDist = Infinity;
  let bestAlong = 0;
  let acc = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) { acc += segLens[i]; continue; }
    const t = Math.max(0, Math.min(1, ((px - p1.x) * dx + (py - p1.y) * dy) / lenSq));
    const cx = p1.x + t * dx;
    const cy = p1.y + t * dy;
    const d = Math.hypot(px - cx, py - cy);
    if (d < bestDist) {
      bestDist = d;
      bestAlong = acc + segLens[i] * t;
    }
    acc += segLens[i];
  }
  const last = points[points.length - 1];
  if (Math.hypot(px - last.x, py - last.y) <= 28 && bestAlong / total >= 0.95) return 1;
  return total > 0 ? Math.min(1, bestAlong / total) : 0;
};

export const buildPolylinePaths = (points: Point[], progress: number) => {
  if (points.length === 0) return { full: '', progressPath: '' };
  let full = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) full += ` L ${points[i].x} ${points[i].y}`;
  if (progress <= 0) return { full, progressPath: '' };
  if (progress >= 0.99) return { full, progressPath: full };
  const segCount = points.length - 1;
  const segIdx = Math.floor(progress * segCount);
  const frac = progress * segCount - segIdx;
  const clamped = Math.min(segIdx, segCount - 1);
  let prog = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i <= clamped; i++) prog += ` L ${points[i].x} ${points[i].y}`;
  if (frac > 0 && clamped < segCount) {
    const a = points[clamped];
    const b = points[clamped + 1];
    prog += ` L ${a.x + (b.x - a.x) * frac} ${a.y + (b.y - a.y) * frac}`;
  }
  return { full, progressPath: prog };
};

/** Diagonal zig-zag from bottom-left to top-right. */
export const makeDiagonalZigZag = (segments: number, amplitude: number): Point[] => {
  const startX = 20; const startY = 75; const endX = 80; const endY = 25;
  const pts: Point[] = [{ x: startX, y: startY }];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const zig = (i % 2 === 0 ? 1 : -1) * amplitude;
    pts.push({ x: startX + (endX - startX) * t + zig, y: startY + (endY - startY) * t });
  }
  pts.push({ x: endX, y: endY });
  return pts;
};

/** Horizontal saw-tooth with vertical amplitude. */
export const makeSawWave = (segments: number, amplitude: number): Point[] => {
  const startX = 20; const startY = 50; const endX = 80;
  const pts: Point[] = [{ x: startX, y: startY }];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const off = (i % 2 === 0 ? 1 : -1) * amplitude;
    pts.push({ x: startX + (endX - startX) * t, y: startY + off });
  }
  pts.push({ x: endX, y: startY });
  return pts;
};
