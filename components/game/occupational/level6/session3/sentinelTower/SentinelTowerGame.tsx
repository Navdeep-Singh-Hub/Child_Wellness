/** OT Level 6 · Session 3 · Game 2 — Sentinel Tower */
import { HeadTrackingGame } from '@/components/game/occupational/level6/session3/HeadTrackingGame';
import React from 'react';

const SentinelTowerGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HeadTrackingGame {...props} mode="lookHold" />
);

export default SentinelTowerGame;
