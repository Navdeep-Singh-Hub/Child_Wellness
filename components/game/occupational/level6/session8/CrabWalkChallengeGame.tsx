/** OT Level 6 · Session 8 · Game 2 — Crab Walk Challenge */
import { AnimalWalkGame } from '@/components/game/occupational/level6/session8/AnimalWalkGame';
import React from 'react';

const CrabWalkChallengeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AnimalWalkGame {...props} mode="crabWalk" />
);

export default CrabWalkChallengeGame;
