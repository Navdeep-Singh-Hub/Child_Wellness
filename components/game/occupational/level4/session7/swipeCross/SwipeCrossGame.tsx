/** OT Level 4 · Session 7 · Game 2 — Swipe Cross */
import { SWIPE_CROSS_CONFIG } from '@/components/game/occupational/level4/session7/swipeCross/swipeCrossTheme';
import { CrossBodySwipeGame } from '@/components/game/occupational/level4/session7/shared/CrossBodySwipeGame';
import React from 'react';

const SwipeCrossGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <CrossBodySwipeGame {...SWIPE_CROSS_CONFIG} {...props} />
);

export default SwipeCrossGame;
