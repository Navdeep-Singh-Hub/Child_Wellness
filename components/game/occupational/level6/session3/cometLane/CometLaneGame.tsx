/** OT Level 6 · Session 3 · Game 5 — Comet Lane */
import { HeadTrackingGame } from '@/components/game/occupational/level6/session3/HeadTrackingGame';
import React from 'react';

const CometLaneGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HeadTrackingGame {...props} mode="starTracker" />
);

export default CometLaneGame;
