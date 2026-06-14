/** OT Level 6 · Session 5 · Game 5 — Magic Scale */
import { WeightShiftGame } from '@/components/game/occupational/level6/session5/WeightShiftGame';
import React from 'react';

const MagicScaleGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <WeightShiftGame {...props} mode="magicScale" />
);

export default MagicScaleGame;
