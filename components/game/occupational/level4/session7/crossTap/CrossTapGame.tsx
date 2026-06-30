/** OT Level 4 · Session 7 · Game 1 — Cross Tap */
import { CROSS_TAP_CONFIG } from '@/components/game/occupational/level4/session7/crossTap/crossTapTheme';
import { CrossBodyArrowGame } from '@/components/game/occupational/level4/session7/shared/CrossBodyArrowGame';
import React from 'react';

const CrossTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <CrossBodyArrowGame {...CROSS_TAP_CONFIG} {...props} />
);

export default CrossTapGame;
