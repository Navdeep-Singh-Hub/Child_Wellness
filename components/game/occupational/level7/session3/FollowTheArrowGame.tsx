/** OT Level 7 · Session 3 · Game 5 — Follow The Arrow */
import { DirectionChangeGame } from '@/components/game/occupational/level7/session3/DirectionChangeGame';
import React from 'react';

const FollowTheArrowGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DirectionChangeGame {...props} mode="followTheArrow" />
);

export default FollowTheArrowGame;
