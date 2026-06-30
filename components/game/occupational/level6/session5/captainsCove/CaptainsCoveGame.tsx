/** OT Level 6 · Session 5 · Game 3 — Captain's Cove */
import { WeightShiftGame } from '@/components/game/occupational/level6/session5/WeightShiftGame';
import React from 'react';

const CaptainsCoveGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <WeightShiftGame {...props} mode="treasureLean" />
);

export default CaptainsCoveGame;
