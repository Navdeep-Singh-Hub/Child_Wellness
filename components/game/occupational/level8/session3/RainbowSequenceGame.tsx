/** OT Level 8 · Session 3 · Game 5 — Rainbow Sequence */
import { MultiStepPlanGame } from '@/components/game/occupational/level8/session3/MultiStepPlanGame';
import React from 'react';

const RainbowSequenceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MultiStepPlanGame {...props} mode="rainbowSequence" />
);

export default RainbowSequenceGame;
