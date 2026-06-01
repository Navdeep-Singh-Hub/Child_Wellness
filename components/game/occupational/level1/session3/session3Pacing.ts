/**
 * Autism-friendly pacing for OT Level 1 Session 3 (timing / speed games).
 * Keeps glow windows long even when blink interval shortens in later play.
 */

/** How long the circle stays brightly lit (ms) — minimum window to tap. */
export function glowHoldMs(blinkIntervalMs: number, minHoldMs = 2000): number {
  return Math.max(minHoldMs, blinkIntervalMs - 400);
}

export const SESSION3_PACING = {
  /** Tap Slowly */
  tapSlowly: {
    initialBlinkInterval: 2600,
    minBlinkInterval: 1800,
    speedDecreasePerStep: 40,
    tapsBeforeSpeedUp: 8,
    glowRiseMs: 300,
    glowHoldMs: 2000,
    glowFallMs: 300,
  },
  /** Tap Fast */
  tapFast: {
    blinkInterval: 1500,
    litDuration: 1100,
    glowRiseMs: 120,
    glowFallMs: 120,
  },
  /** Slow Then Fast */
  slowThenFast: {
    slowBlinkInterval: 2800,
    fastBlinkInterval: 1400,
    slowGlowHoldMs: 2200,
    fastGlowHoldMs: 1600,
    glowRiseSlowMs: 300,
    glowRiseFastMs: 200,
    glowFallSlowMs: 300,
    glowFallFastMs: 200,
  },
  /** Race the Dot */
  raceDot: {
    goalDistance: 240,
    slowSpeedPerTap: 48,
    fastSpeedPerTap: 40,
    slowRounds: 7,
    nextRoundDelayMs: 350,
  },
} as const;
