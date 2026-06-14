/** OT Level 6 · Session 6 · Game 4 — Adventure Trail */
import { DynamicBalanceGame } from '@/components/game/occupational/level6/session6/DynamicBalanceGame';
import React from 'react';

const AdventureTrailGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DynamicBalanceGame {...props} mode="adventureTrail" />
);

export default AdventureTrailGame;
