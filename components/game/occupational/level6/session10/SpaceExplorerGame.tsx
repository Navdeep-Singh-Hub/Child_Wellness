/** OT Level 6 · Session 10 · Game 3 — Space Explorer */
import { IntegratedChallengeGame } from '@/components/game/occupational/level6/session10/IntegratedChallengeGame';
import React from 'react';

const SpaceExplorerGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <IntegratedChallengeGame {...props} mode="spaceExplorer" />
);

export default SpaceExplorerGame;
