/** OT Level 8 · Session 9 · Game 4 — Surprise Actions */
import { NovelChallengeGame } from '@/components/game/occupational/level8/session9/NovelChallengeGame';
import React from 'react';

const SurpriseActionsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <NovelChallengeGame {...props} mode="surpriseActions" />
);

export default SurpriseActionsGame;
