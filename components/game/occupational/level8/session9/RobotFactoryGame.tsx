/** OT Level 8 · Session 9 · Game 2 — Robot Factory */
import { NovelChallengeGame } from '@/components/game/occupational/level8/session9/NovelChallengeGame';
import React from 'react';

const RobotFactoryGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <NovelChallengeGame {...props} mode="robotFactory" />
);

export default RobotFactoryGame;
