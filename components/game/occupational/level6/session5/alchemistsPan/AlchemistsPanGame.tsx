/** OT Level 6 · Session 5 · Game 5 — Alchemist's Pan */
import { WeightShiftGame } from '@/components/game/occupational/level6/session5/WeightShiftGame';
import React from 'react';

const AlchemistsPanGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <WeightShiftGame {...props} mode="magicScale" />
);

export default AlchemistsPanGame;
