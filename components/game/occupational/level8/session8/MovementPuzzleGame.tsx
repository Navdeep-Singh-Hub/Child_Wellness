/** OT Level 8 · Session 8 · Game 3 — Movement Puzzle */
import { ProblemSolveGame } from '@/components/game/occupational/level8/session8/ProblemSolveGame';
import React from 'react';

const MovementPuzzleGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ProblemSolveGame {...props} mode="movementPuzzle" />
);

export default MovementPuzzleGame;
