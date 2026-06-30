/** OT Level 6 · Session 1 · Game 2 — Crown Keeper */
import { PostureControlGame } from '@/components/game/occupational/level6/session1/PostureControlGame';
import React from 'react';

const CrownKeeperGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureControlGame {...props} mode="crown" />
);

export default CrownKeeperGame;
