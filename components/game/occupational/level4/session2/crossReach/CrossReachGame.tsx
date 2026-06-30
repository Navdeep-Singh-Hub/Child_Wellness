/** OT Level 4 · Session 2 · Game 4 — Cross Reach */
import { CROSS_REACH_CONFIG } from '@/components/game/occupational/level4/session2/crossReach/crossReachTheme';
import { ReverseHorizontalDragGame } from '@/components/game/occupational/level4/session2/shared/ReverseHorizontalDragGame';
import React from 'react';

const CrossReachGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReverseHorizontalDragGame {...CROSS_REACH_CONFIG} {...props} />
);

export default CrossReachGame;
