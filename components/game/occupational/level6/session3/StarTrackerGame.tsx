/** OT Level 6 · Session 3 · Game 5 — Star Tracker */
import { HeadTrackingGame } from '@/components/game/occupational/level6/session3/HeadTrackingGame';
import React from 'react';

const StarTrackerGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HeadTrackingGame {...props} mode="starTracker" />
);

export default StarTrackerGame;
