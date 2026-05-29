import type { CoordinationPose } from '@/components/game/speech/lip-closure/modules/lipCoordinationTypes';

export function rhythmMouthSequence(round: number): CoordinationPose[] {
  if (round <= 1) return ['ROUNDED', 'SPREAD', 'ROUNDED', 'SPREAD'];
  if (round === 2) return ['ROUNDED', 'SPREAD', 'ROUNDED', 'SPREAD', 'ROUNDED'];
  return ['SPREAD', 'ROUNDED', 'SPREAD', 'ROUNDED', 'SPREAD', 'ROUNDED'];
}

export function copyAvatarSequence(): CoordinationPose[] {
  return ['ROUNDED', 'SPREAD'];
}

export function mouthMemorySequence(round: number): CoordinationPose[] {
  if (round <= 1) return ['CLOSED', 'SPREAD'];
  if (round === 2) return ['ROUNDED', 'SPREAD', 'CLOSED'];
  return ['ROUNDED', 'SPREAD', 'ROUNDED', 'CLOSED'];
}

export function beatBuilderSequence(round: number): CoordinationPose[] {
  if (round <= 1) return ['NEUTRAL', 'ROUNDED', 'SPREAD', 'ROUNDED'];
  if (round === 2) return ['ROUNDED', 'SPREAD', 'ROUNDED', 'SPREAD', 'NEUTRAL'];
  return ['CLOSED', 'ROUNDED', 'SPREAD', 'ROUNDED', 'SPREAD'];
}

export function lipOrchestraSequence(round: number): CoordinationPose[] {
  if (round <= 1) return ['CLOSED', 'ROUNDED', 'SPREAD', 'ROUNDED'];
  if (round === 2) return ['CLOSED', 'ROUNDED', 'SPREAD', 'ROUNDED', 'SPREAD', 'CLOSED'];
  return ['CLOSED', 'ROUNDED', 'SPREAD', 'ROUNDED', 'SPREAD', 'ROUNDED', 'CLOSED'];
}

/** Demo playback order for memory / avatar watch phase. */
export function demoDelayMs(index: number) {
  return 900 + index * 700;
}
