/**
 * Helpers for OT Level 4 Session 8 side-tap games.
 */

export { useTraceSound } from '@/components/game/occupational/level4/session1/dragUtils';

export type Side = 'left' | 'right';
export type SoundCue = 'bell' | 'drum' | 'clap' | 'beep';

const SOUNDS: SoundCue[] = ['bell', 'drum', 'clap', 'beep'];

export const randomSide = (): Side => (Math.random() < 0.5 ? 'left' : 'right');

export const randomSound = (): SoundCue => SOUNDS[Math.floor(Math.random() * SOUNDS.length)];

export const randomCountNumber = (): number => Math.floor(Math.random() * 20) + 1;

export const sideForNumber = (n: number): Side => (n % 2 === 1 ? 'left' : 'right');

export const soundEmoji = (sound: SoundCue): string => {
  switch (sound) {
    case 'bell':
      return '🔔';
    case 'drum':
      return '🥁';
    case 'clap':
      return '👏';
    case 'beep':
      return '🔊';
  }
};
