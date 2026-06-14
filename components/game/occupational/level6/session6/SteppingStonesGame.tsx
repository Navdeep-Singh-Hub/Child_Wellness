/** OT Level 6 · Session 6 · Game 1 — Stepping Stones */
import { DynamicBalanceGame } from '@/components/game/occupational/level6/session6/DynamicBalanceGame';
import React from 'react';

const SteppingStonesGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DynamicBalanceGame {...props} mode="steppingStones" />
);

export default SteppingStonesGame;
