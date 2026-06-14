/** OT Level 6 · Session 2 · Game 5 — Freeze & Balance */
import { StandingPostureGame } from '@/components/game/occupational/level6/session2/StandingPostureGame';
import React from 'react';

const FreezeBalanceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <StandingPostureGame {...props} mode="freezeBalance" />
);

export default FreezeBalanceGame;
