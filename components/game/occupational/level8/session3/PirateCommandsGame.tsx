/** OT Level 8 · Session 3 · Game 4 — Pirate Commands */
import { MultiStepPlanGame } from '@/components/game/occupational/level8/session3/MultiStepPlanGame';
import React from 'react';

const PirateCommandsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MultiStepPlanGame {...props} mode="pirateCommands" />
);

export default PirateCommandsGame;
