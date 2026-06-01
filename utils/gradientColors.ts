/** Normalize #RRGGBB hex; fallback if invalid. */
export function normalizeHex(hex: string, fallback = '#3B82F6'): string {
  if (typeof hex === 'string' && /^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
  return fallback;
}

/** RGBA string — reliable on Android expo-linear-gradient (avoids #RRGGBBAA parse NPE). */
export function hexToRgba(hex: string, alpha: number): string {
  const base = normalizeHex(hex);
  const n = parseInt(base.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Three-stop gradient colors safe for expo-linear-gradient on Android. */
export function gradientStopsFromHex(hex: string): [string, string, string] {
  const base = normalizeHex(hex);
  return [hexToRgba(base, 1), hexToRgba(base, 0.87), hexToRgba(base, 0.67)];
}
