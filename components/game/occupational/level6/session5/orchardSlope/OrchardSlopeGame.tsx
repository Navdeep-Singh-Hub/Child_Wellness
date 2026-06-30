/** OT Level 6 · Session 5 · Game 1 — Orchard Slope */
import { WeightShiftGame } from '@/components/game/occupational/level6/session5/WeightShiftGame';
import React from 'react';

const OrchardSlopeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <WeightShiftGame {...props} mode="appleReach" />
);

export default OrchardSlopeGame;
