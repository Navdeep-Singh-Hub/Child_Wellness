/** OT Level 8 · Session 3 · Game 2 — Star Sequence */
import { MultiStepPlanGame } from '@/components/game/occupational/level8/session3/MultiStepPlanGame';
import React from 'react';

const StarSequenceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MultiStepPlanGame {...props} mode="starSequence" />
);

export default StarSequenceGame;
