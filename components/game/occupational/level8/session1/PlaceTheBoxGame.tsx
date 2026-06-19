/** OT Level 8 · Session 1 · Game 5 — Place The Box */
import { MotorPlanGame } from '@/components/game/occupational/level8/session1/MotorPlanGame';
import React from 'react';

const PlaceTheBoxGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MotorPlanGame {...props} mode="placeBox" />
);

export default PlaceTheBoxGame;
