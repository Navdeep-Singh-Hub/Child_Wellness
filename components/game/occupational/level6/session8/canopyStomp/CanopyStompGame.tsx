/** OT Level 6 · Session 8 · Game 5 — Canopy Stomp */
import { AnimalWalkGame } from '@/components/game/occupational/level6/session8/AnimalWalkGame';
import React from 'react';

const CanopyStompGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AnimalWalkGame {...props} mode="gorillaMarch" />
);

export default CanopyStompGame;
