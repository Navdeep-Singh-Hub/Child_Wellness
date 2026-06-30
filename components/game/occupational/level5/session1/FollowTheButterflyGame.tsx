/** OT Level 5 · Session 1 · Game 1 — Butterfly Trail */
import ButterflyTrailGame from '@/components/game/occupational/level5/session1/butterflyTrail/ButterflyTrailGame';
import React from 'react';

const FollowTheButterflyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ButterflyTrailGame {...props} />
);

export default FollowTheButterflyGame;
