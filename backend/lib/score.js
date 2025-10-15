export function scoreForDelta(targetMs, deltaMs) {
  const base = Math.max(0, 100 - Math.round(deltaMs / 100)); // 1pt per 100ms
  const bonus = targetMs >= 34000 ? 6 : targetMs >= 13000 ? 3 : 0;
  return Math.min(120, base + bonus);
}
