/** OT Level 6 · Session 3 · Game 4 — Royal Orbit */
import { HeadTrackingGame } from '@/components/game/occupational/level6/session3/HeadTrackingGame';
import React from 'react';

const RoyalOrbitGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HeadTrackingGame {...props} mode="keepCrown" />
);

export default RoyalOrbitGame;
