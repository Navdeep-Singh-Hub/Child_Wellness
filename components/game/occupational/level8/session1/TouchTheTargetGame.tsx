/** OT Level 8 · Session 1 · Game 1 — Touch The Target */
import { MotorPlanGame } from '@/components/game/occupational/level8/session1/MotorPlanGame';
import React from 'react';

const TouchTheTargetGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MotorPlanGame {...props} mode="touchTarget" />
);

export default TouchTheTargetGame;
