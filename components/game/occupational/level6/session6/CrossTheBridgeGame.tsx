/** OT Level 6 · Session 6 · Game 2 — Cross The Bridge */
import { DynamicBalanceGame } from '@/components/game/occupational/level6/session6/DynamicBalanceGame';
import React from 'react';

const CrossTheBridgeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DynamicBalanceGame {...props} mode="crossBridge" />
);

export default CrossTheBridgeGame;
