/** OT Level 6 · Session 6 · Game 5 — Summit Quest */
import { DynamicBalanceGame } from '@/components/game/occupational/level6/session6/DynamicBalanceGame';
import React from 'react';

const SummitQuestGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DynamicBalanceGame {...props} mode="balanceJourney" />
);

export default SummitQuestGame;
