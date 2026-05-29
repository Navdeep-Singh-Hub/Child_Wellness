import type { LipPose } from '@/components/game/speech/lip-closure/modules/LipTransitionEngine';

export function alternationSequence(round: number): LipPose[] {
  const cycles = round <= 1 ? 1 : round === 2 ? 2 : 3;
  const seq: LipPose[] = [];
  for (let i = 0; i < cycles; i++) {
    seq.push('ROUNDED', 'SPREAD');
  }
  return seq;
}

export function robotSequence(): LipPose[] {
  return ['ROUNDED', 'SPREAD', 'ROUNDED'];
}

export function danceSequence(round: number): LipPose[] {
  if (round <= 1) return ['ROUNDED', 'SPREAD', 'NEUTRAL', 'SPREAD'];
  if (round === 2) return ['ROUNDED', 'SPREAD', 'ROUNDED', 'SPREAD', 'NEUTRAL'];
  return ['SPREAD', 'ROUNDED', 'SPREAD', 'NEUTRAL', 'ROUNDED', 'SPREAD'];
}

export function fastSequence(round: number): LipPose[] {
  const n = round <= 1 ? 2 : round === 2 ? 3 : 4;
  const seq: LipPose[] = [];
  for (let i = 0; i < n; i++) seq.push(i % 2 === 0 ? 'ROUNDED' : 'SPREAD');
  return seq;
}
