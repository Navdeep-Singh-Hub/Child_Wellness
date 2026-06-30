/** OT Level 6 · Session 3 · Game 1 — Launch Pad */
import { HeadTrackingGame } from '@/components/game/occupational/level6/session3/HeadTrackingGame';
import React from 'react';

const LaunchPadGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HeadTrackingGame {...props} mode="rocketWatch" />
);

export default LaunchPadGame;
