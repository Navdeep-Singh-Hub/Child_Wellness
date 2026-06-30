/** OT Level 6 · Session 10 · Game 5 — Champion Gauntlet */
import { IntegratedChallengeGame } from '@/components/game/occupational/level6/session10/IntegratedChallengeGame';
import React from 'react';

const ChampionGauntletGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <IntegratedChallengeGame {...props} mode="otObstacleCourse" />
);

export default ChampionGauntletGame;
