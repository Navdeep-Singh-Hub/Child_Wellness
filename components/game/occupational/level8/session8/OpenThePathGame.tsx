/** OT Level 8 · Session 8 · Game 2 — Open The Path */
import { ProblemSolveGame } from '@/components/game/occupational/level8/session8/ProblemSolveGame';
import React from 'react';

const OpenThePathGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ProblemSolveGame {...props} mode="openThePath" />
);

export default OpenThePathGame;
