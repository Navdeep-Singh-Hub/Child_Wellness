/** OT Level 7 · Session 2 · Game 4 — Star Tracker (vestibular) */
import { VestibularHeadGame } from '@/components/game/occupational/level7/session2/VestibularHeadGame';
import React from 'react';

const VestibularStarTrackerGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VestibularHeadGame {...props} mode="starTracker" />
);

export default VestibularStarTrackerGame;
