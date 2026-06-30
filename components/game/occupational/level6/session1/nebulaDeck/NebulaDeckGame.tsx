/** OT Level 6 · Session 1 · Game 5 — Star Reach Mission */
import { PostureControlGame } from '@/components/game/occupational/level6/session1/PostureControlGame';
import React from 'react';

const StarReachMissionGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureControlGame {...props} mode="reach" />
);

export default StarReachMissionGame;
