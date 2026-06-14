/** OT Level 7 · Session 1 · Game 4 — Wave Walker */
import { LinearMovementGame } from '@/components/game/occupational/level7/session1/LinearMovementGame';
import React from 'react';

const WaveWalkerGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <LinearMovementGame {...props} mode="waveWalker" />
);

export default WaveWalkerGame;
