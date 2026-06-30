/** OT Level 6 · Session 4 · Game 2 — Driftwood Isles */
import { BalanceGame } from '@/components/game/occupational/level6/session4/BalanceGame';
import React from 'react';

const DriftwoodIslesGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BalanceGame {...props} mode="island" />
);

export default DriftwoodIslesGame;
