/** OT Level 7 · Session 4 · Game 4 — Orbit Hunt */
import { RotationalProcessingGame } from '@/components/game/occupational/level7/session4/RotationalProcessingGame';
import React from 'react';

const OrbitHuntGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RotationalProcessingGame {...props} mode="orbitHunt" />
);

export default OrbitHuntGame;
