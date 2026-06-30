/** OT Level 6 · Session 10 · Game 3 — Nebula Run */
import { IntegratedChallengeGame } from '@/components/game/occupational/level6/session10/IntegratedChallengeGame';
import React from 'react';

const NebulaRunGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <IntegratedChallengeGame {...props} mode="spaceExplorer" />
);

export default NebulaRunGame;
