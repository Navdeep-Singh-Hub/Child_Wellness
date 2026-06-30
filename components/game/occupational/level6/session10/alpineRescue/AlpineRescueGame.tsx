/** OT Level 6 · Session 10 · Game 4 — Alpine Rescue */
import { IntegratedChallengeGame } from '@/components/game/occupational/level6/session10/IntegratedChallengeGame';
import React from 'react';

const AlpineRescueGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <IntegratedChallengeGame {...props} mode="mountainRescue" />
);

export default AlpineRescueGame;
