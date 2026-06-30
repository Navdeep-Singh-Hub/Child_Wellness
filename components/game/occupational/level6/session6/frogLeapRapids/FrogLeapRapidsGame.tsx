/** OT Level 6 · Session 6 · Game 3 — Frog Leap Rapids */
import { DynamicBalanceGame } from '@/components/game/occupational/level6/session6/DynamicBalanceGame';
import React from 'react';

const FrogLeapRapidsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DynamicBalanceGame {...props} mode="riverCrossing" />
);

export default FrogLeapRapidsGame;
