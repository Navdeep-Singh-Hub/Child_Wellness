'use client';

import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export function triggerConfetti() {
  const count = 120;
  const defaults = { origin: { y: 0.7 } };
  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
  }
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

export function ConfettiOnMount() {
  useEffect(() => {
    triggerConfetti();
  }, []);
  return null;
}
