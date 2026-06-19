/** OT Level 8 · Session 8 · Game 5 — Escape Course */
import { ProblemSolveGame } from '@/components/game/occupational/level8/session8/ProblemSolveGame';
import React from 'react';

const EscapeCourseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ProblemSolveGame {...props} mode="escapeCourse" />
);

export default EscapeCourseGame;
