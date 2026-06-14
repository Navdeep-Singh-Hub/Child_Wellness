/** OT Level 7 · Session 4 · Game 2 — Spin & Stop */
import { RotationalProcessingGame } from '@/components/game/occupational/level7/session4/RotationalProcessingGame';
import React from 'react';

const SpinAndStopGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RotationalProcessingGame {...props} mode="spinAndStop" />
);

export default SpinAndStopGame;
