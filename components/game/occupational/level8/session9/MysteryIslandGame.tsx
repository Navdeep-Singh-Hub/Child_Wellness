/** OT Level 8 · Session 9 · Game 3 — Mystery Island */
import { NovelChallengeGame } from '@/components/game/occupational/level8/session9/NovelChallengeGame';
import React from 'react';

const MysteryIslandGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <NovelChallengeGame {...props} mode="mysteryIsland" />
);

export default MysteryIslandGame;
