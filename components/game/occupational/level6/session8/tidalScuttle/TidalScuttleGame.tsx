/** OT Level 6 · Session 8 · Game 2 — Tidal Scuttle */
import { AnimalWalkGame } from '@/components/game/occupational/level6/session8/AnimalWalkGame';
import React from 'react';

const TidalScuttleGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AnimalWalkGame {...props} mode="crabWalk" />
);

export default TidalScuttleGame;
