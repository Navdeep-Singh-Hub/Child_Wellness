/** OT Level 6 · Session 9 · Game 2 — Sky Lane */
import { PosturalEnduranceGame } from '@/components/game/occupational/level6/session9/PosturalEnduranceGame';
import React from 'react';

const SkyLaneGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PosturalEnduranceGame {...props} mode="airplaneHold" />
);

export default SkyLaneGame;
