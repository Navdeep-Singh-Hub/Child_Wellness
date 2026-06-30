/** OT Level 6 · Session 4 · Game 4 — Star Pier */
import { BalanceGame } from '@/components/game/occupational/level6/session4/BalanceGame';
import React from 'react';

const StarPierGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BalanceGame {...props} mode="starHold" />
);

export default StarPierGame;
