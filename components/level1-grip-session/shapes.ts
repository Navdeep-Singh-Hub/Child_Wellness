import type { Point } from './shapeFillUtils';

/** Butterfly outline: 200x200 box, symmetric. Points in shape-local coords (0..200). */
export const BUTTERFLY_POLYGON: Point[] = (() => {
  const pts: Point[] = [];
  const cx = 100;
  const cy = 100;
  const w = 90;
  const h = 80;
  // Left wing
  for (let i = 0; i <= 8; i++) {
    const t = (i / 8) * Math.PI * 0.9;
    pts.push({ x: cx - w * 0.4 - Math.cos(t) * w * 0.5, y: cy - Math.sin(t) * h * 0.8 });
  }
  pts.push({ x: cx - 8, y: cy + h * 0.4 });
  pts.push({ x: cx, y: cy + h * 0.5 });
  pts.push({ x: cx + 8, y: cy + h * 0.4 });
  // Right wing
  for (let i = 8; i >= 0; i--) {
    const t = (i / 8) * Math.PI * 0.9;
    pts.push({ x: cx + w * 0.4 + Math.cos(t) * w * 0.5, y: cy - Math.sin(t) * h * 0.8 });
  }
  pts.push({ x: cx - 8, y: cy - h * 0.2 });
  return pts;
})();

/** Flower outline: 200x200 box. Center circle + 5 petals. */
export const FLOWER_POLYGON: Point[] = (() => {
  const pts: Point[] = [];
  const cx = 100;
  const cy = 100;
  const R = 55;
  const petals = 5;
  for (let i = 0; i < petals; i++) {
    const a0 = (i / petals) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / petals) * Math.PI * 2 - Math.PI / 2;
    pts.push({ x: cx + Math.cos(a0) * R * 0.3, y: cy + Math.sin(a0) * R * 0.3 });
    pts.push({ x: cx + Math.cos((a0 + a1) / 2) * R, y: cy + Math.sin((a0 + a1) / 2) * R });
    pts.push({ x: cx + Math.cos(a1) * R * 0.3, y: cy + Math.sin(a1) * R * 0.3 });
  }
  return pts;
})();

/** Transform shape polygon from 200x200 box to canvas space (width x height). */
export function shapeToCanvas(poly: Point[], width: number, height: number): Point[] {
  const box = 200;
  const scale = Math.min(width, height) / box;
  const offsetX = (width - box * scale) / 2;
  const offsetY = (height - box * scale) / 2;
  return poly.map((p) => ({
    x: offsetX + p.x * scale,
    y: offsetY + p.y * scale,
  }));
}

/** SVG path for butterfly outline (same 200x200 box). Built from polygon. */
export function getButterflyPath(w: number, h: number): string {
  const scaled = shapeToCanvas(BUTTERFLY_POLYGON, w, h);
  if (scaled.length === 0) return '';
  let path = `M ${scaled[0].x} ${scaled[0].y}`;
  for (let i = 1; i < scaled.length; i++) path += ` L ${scaled[i].x} ${scaled[i].y}`;
  return path + ' Z';
}

/** SVG path for flower outline (200x200 box). Built from polygon. */
export function getFlowerPath(w: number, h: number): string {
  const scaled = shapeToCanvas(FLOWER_POLYGON, w, h);
  if (scaled.length === 0) return '';
  let path = `M ${scaled[0].x} ${scaled[0].y}`;
  for (let i = 1; i < scaled.length; i++) path += ` L ${scaled[i].x} ${scaled[i].y}`;
  return path + ' Z';
}
