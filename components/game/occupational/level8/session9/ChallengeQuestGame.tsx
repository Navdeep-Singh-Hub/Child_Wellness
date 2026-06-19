/** OT Level 8 · Session 9 · Game 5 — Challenge Quest */
import { NovelChallengeGame } from '@/components/game/occupational/level8/session9/NovelChallengeGame';
import React from 'react';

const ChallengeQuestGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <NovelChallengeGame {...props} mode="challengeQuest" />
);

export default ChallengeQuestGame;
