/** OT Level 6 · Session 2 · Game 2 — Soldier Stand */
import { StandingPostureGame } from '@/components/game/occupational/level6/session2/StandingPostureGame';
import React from 'react';

const SoldierStandGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <StandingPostureGame {...props} mode="soldier" />
);

export default SoldierStandGame;
