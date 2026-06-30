/** OT Level 6 · Session 6 · Game 2 — Castle Span */
import { DynamicBalanceGame } from '@/components/game/occupational/level6/session6/DynamicBalanceGame';
import React from 'react';

const CastleSpanGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DynamicBalanceGame {...props} mode="crossBridge" />
);

export default CastleSpanGame;
