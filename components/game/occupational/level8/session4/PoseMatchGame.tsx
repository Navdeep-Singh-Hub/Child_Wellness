/** OT Level 8 · Session 4 · Game 4 — Pose Match */
import { ImitationGame } from '@/components/game/occupational/level8/session4/ImitationGame';
import React from 'react';

const PoseMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ImitationGame {...props} mode="poseMatch" />
);

export default PoseMatchGame;
