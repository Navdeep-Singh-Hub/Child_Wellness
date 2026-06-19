/** OT Level 8 · Session 4 · Game 1 — Robot Copy */
import { ImitationGame } from '@/components/game/occupational/level8/session4/ImitationGame';
import React from 'react';

const RobotCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ImitationGame {...props} mode="robotCopy" />
);

export default RobotCopyGame;
