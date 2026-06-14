/** OT Level 6 · Session 8 · Game 5 — Gorilla March */
import { AnimalWalkGame } from '@/components/game/occupational/level6/session8/AnimalWalkGame';
import React from 'react';

const GorillaMarchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AnimalWalkGame {...props} mode="gorillaMarch" />
);

export default GorillaMarchGame;
