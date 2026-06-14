/** OT Level 6 · Session 4 · Game 3 — Balance Statue */
import { BalanceGame } from '@/components/game/occupational/level6/session4/BalanceGame';
import React from 'react';

const BalanceStatueGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BalanceGame {...props} mode="statue" />
);

export default BalanceStatueGame;
