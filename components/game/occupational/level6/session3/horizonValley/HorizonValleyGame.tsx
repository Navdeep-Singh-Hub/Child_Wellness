/** OT Level 6 · Session 3 · Game 3 — Horizon Valley */
import { HeadTrackingGame } from '@/components/game/occupational/level6/session3/HeadTrackingGame';
import React from 'react';

const HorizonValleyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HeadTrackingGame {...props} mode="skyGround" />
);

export default HorizonValleyGame;
