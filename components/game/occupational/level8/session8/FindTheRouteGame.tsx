/** OT Level 8 · Session 8 · Game 1 — Find The Route */
import { ProblemSolveGame } from '@/components/game/occupational/level8/session8/ProblemSolveGame';
import React from 'react';

const FindTheRouteGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ProblemSolveGame {...props} mode="findTheRoute" />
);

export default FindTheRouteGame;
