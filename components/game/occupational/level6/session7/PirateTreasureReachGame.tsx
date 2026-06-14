/** OT Level 6 · Session 7 · Game 2 — Pirate Treasure Reach */
import { TrunkRotationGame } from '@/components/game/occupational/level6/session7/TrunkRotationGame';
import React from 'react';

const PirateTreasureReachGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <TrunkRotationGame {...props} mode="pirateTreasure" />
);

export default PirateTreasureReachGame;
