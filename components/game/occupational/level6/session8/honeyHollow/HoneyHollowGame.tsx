/** OT Level 6 · Session 8 · Game 1 — Honey Hollow */
import { AnimalWalkGame } from '@/components/game/occupational/level6/session8/AnimalWalkGame';
import React from 'react';

const HoneyHollowGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AnimalWalkGame {...props} mode="bearWalk" />
);

export default HoneyHollowGame;
