/** OT Level 8 · Session 3 · Game 3 — Mission Steps */
import { MultiStepPlanGame } from '@/components/game/occupational/level8/session3/MultiStepPlanGame';
import React from 'react';

const MissionStepsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MultiStepPlanGame {...props} mode="missionSteps" />
);

export default MissionStepsGame;
