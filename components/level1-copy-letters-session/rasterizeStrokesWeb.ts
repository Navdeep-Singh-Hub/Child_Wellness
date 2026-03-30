/**
 * Web-only: build a PNG (base64, no data: prefix) from SVG stroke paths.
 * Used when react-native-view-shot cannot capture the drawing view on RN Web.
 */
import type { Point } from '@/components/level1-grip-session/shapeFillUtils';
import { pathToPoints } from '@/components/level1-grip-session/shapeFillUtils';

export interface StrokeLike {
  path: string;
  width?: number;
  color?: string;
}

function collectBounds(polylines: Point[][]): { minX: number; minY: number; maxX: number; maxY: number } | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let any = false;
  for (const pl of polylines) {
    for (const p of pl) {
      any = true;
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }
  if (!any) return null;
  return { minX, minY, maxX, maxY };
}

/**
 * Returns PNG base64 without prefix, or null if nothing drawable.
 */
export function rasterizeStrokesToPngBase64(
  strokes: StrokeLike[],
  outW = 384,
  outH = 384
): string | null {
  if (typeof document === 'undefined') return null;

  const polylines: Point[][] = [];
  for (const s of strokes) {
    const pts = pathToPoints(s.path);
    if (pts.length >= 2) polylines.push(pts);
  }
  if (polylines.length === 0) return null;

  const b = collectBounds(polylines);
  if (!b) return null;

  const bw = Math.max(b.maxX - b.minX, 8);
  const bh = Math.max(b.maxY - b.minY, 8);
  const pad = Math.max(bw, bh) * 0.1;
  const innerW = bw + 2 * pad;
  const innerH = bh + 2 * pad;
  const scale = Math.min(outW / innerW, outH / innerH);
  const drawW = innerW * scale;
  const drawH = innerH * scale;
  const ox = (outW - drawW) / 2;
  const oy = (outH - drawH) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outW, outH);

  const map = (p: Point) => ({
    x: (p.x - b.minX + pad) * scale + ox,
    y: (p.y - b.minY + pad) * scale + oy,
  });

  for (const s of strokes) {
    const pts = pathToPoints(s.path);
    if (pts.length < 2) continue;
    ctx.beginPath();
    const m0 = map(pts[0]);
    ctx.moveTo(m0.x, m0.y);
    for (let i = 1; i < pts.length; i++) {
      const m = map(pts[i]);
      ctx.lineTo(m.x, m.y);
    }
    ctx.strokeStyle = s.color || '#1e40af';
    ctx.lineWidth = Math.max(2, (s.width ?? 10) * scale * 0.85);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.replace(/^data:image\/\w+;base64,/, '');
}
