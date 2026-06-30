/** OT Level 6 · Session 4 · Game 3 — Tide Temple */
import { BalanceGame } from '@/components/game/occupational/level6/session4/BalanceGame';
import React from 'react';

const TideTempleGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BalanceGame {...props} mode="statue" />
);

export default TideTempleGame;
