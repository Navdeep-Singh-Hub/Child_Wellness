/** OT Level 8 · Session 8 · Game 4 — Rescue Mission */
import { ProblemSolveGame } from '@/components/game/occupational/level8/session8/ProblemSolveGame';
import React from 'react';

const RescueMissionGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ProblemSolveGame {...props} mode="rescueMission" />
);

export default RescueMissionGame;
