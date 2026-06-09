/**
 * Pacing constants for OT Level 4 Session 10 (cross-body rhythm imitation).
 */

export const SESSION4_10_PACING = {
  clapRounds: 8,
  shoulderRounds: 8,
  musicRounds: 8,
  memoryRounds: 6,
  speedRounds: 10,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 400,
  clapBeatMs: 600,
  shoulderBeatMs: 700,
  musicBeatMs: 600,
  memoryBeatMs: 600,
  speedInitialBeatMs: 800,
  speedMinBeatMs: 400,
  speedDecreaseMs: 50,
  clapToleranceMs: 250,
  shoulderToleranceMs: 300,
  musicToleranceMs: 250,
  memoryToleranceMs: 250,
  speedTolerancePct: 0.4,
  memoryPauseMs: 2000,
  listenLeadMs: 500,
  xpClap: 20,
  xpShoulder: 20,
  xpMusic: 20,
  xpMemory: 22,
  xpSpeed: 20,
} as const;

export const CLAP_PATTERNS = [
  ['left', 'right'],
  ['left', 'right', 'left'],
  ['right', 'left', 'right'],
  ['left', 'left', 'right', 'right'],
  ['right', 'right', 'left', 'left'],
  ['left', 'right', 'left', 'right'],
  ['right', 'left', 'right', 'left', 'right'],
  ['left', 'right', 'right', 'left', 'left', 'right'],
] as const;

export const SHOULDER_PATTERNS = [
  ['right-to-left'],
  ['left-to-right'],
  ['right-to-left', 'left-to-right'],
  ['left-to-right', 'right-to-left'],
  ['right-to-left', 'right-to-left', 'left-to-right'],
  ['left-to-right', 'left-to-right', 'right-to-left'],
  ['right-to-left', 'left-to-right', 'right-to-left', 'left-to-right'],
  ['left-to-right', 'right-to-left', 'left-to-right', 'right-to-left', 'left-to-right'],
] as const;

export const MUSIC_PATTERNS = [
  ['left-hand', 'right-hand'],
  ['right-hand', 'left-hand'],
  ['left-hand', 'right-hand', 'left-hand'],
  ['both-hands', 'left-hand', 'right-hand'],
  ['right-hand', 'both-hands', 'left-hand'],
  ['left-hand', 'both-hands', 'right-hand', 'both-hands'],
  ['right-hand', 'left-hand', 'right-hand', 'left-hand', 'both-hands'],
  ['both-hands', 'left-hand', 'both-hands', 'right-hand', 'both-hands'],
] as const;

export const MEMORY_PATTERNS = [
  ['left', 'right'],
  ['right', 'left', 'right'],
  ['left', 'right', 'left', 'right'],
  ['right', 'left', 'left', 'right'],
  ['left', 'left', 'right', 'right', 'left'],
  ['right', 'left', 'right', 'left', 'right', 'left'],
] as const;

export const SPEED_PATTERNS = [
  ['left', 'right'],
  ['right', 'left'],
  ['left', 'right', 'left'],
  ['right', 'left', 'right'],
  ['left', 'left', 'right'],
  ['right', 'right', 'left'],
  ['left', 'right', 'left', 'right'],
  ['right', 'left', 'right', 'left'],
  ['left', 'right', 'right', 'left'],
  ['right', 'left', 'left', 'right'],
] as const;
