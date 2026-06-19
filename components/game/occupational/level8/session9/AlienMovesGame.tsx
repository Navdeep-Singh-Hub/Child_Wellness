/** OT Level 8 · Session 9 · Game 1 — Alien Moves */
import { NovelChallengeGame } from '@/components/game/occupational/level8/session9/NovelChallengeGame';
import React from 'react';

const AlienMovesGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <NovelChallengeGame {...props} mode="alienMoves" />
);

export default AlienMovesGame;
