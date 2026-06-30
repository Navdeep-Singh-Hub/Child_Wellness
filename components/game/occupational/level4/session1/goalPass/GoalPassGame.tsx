/** OT Level 4 · Session 1 · Game 1 — Goal Pass */
import { GOAL_PASS_CONFIG } from '@/components/game/occupational/level4/session1/goalPass/goalPassTheme';
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/shared/HorizontalDragGame';
import React from 'react';

const GoalPassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame {...GOAL_PASS_CONFIG} {...props} />
);

export default GoalPassGame;
