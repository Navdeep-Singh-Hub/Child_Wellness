/** OT Level 8 · Session 3 · Game 1 — Action Chain */
import { MultiStepPlanGame } from '@/components/game/occupational/level8/session3/MultiStepPlanGame';
import React from 'react';

const ActionChainGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MultiStepPlanGame {...props} mode="actionChain" />
);

export default ActionChainGame;
