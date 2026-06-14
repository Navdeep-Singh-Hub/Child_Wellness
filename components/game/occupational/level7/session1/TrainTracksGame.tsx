/** OT Level 7 · Session 1 · Game 1 — Train Tracks */
import { LinearMovementGame } from '@/components/game/occupational/level7/session1/LinearMovementGame';
import React from 'react';

const TrainTracksGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <LinearMovementGame {...props} mode="trainTracks" />
);

export default TrainTracksGame;
