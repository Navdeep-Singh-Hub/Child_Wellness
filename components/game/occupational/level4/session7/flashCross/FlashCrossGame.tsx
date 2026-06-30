/** OT Level 4 · Session 7 · Game 5 — Flash Cross */
import { FLASH_CROSS_CONFIG } from '@/components/game/occupational/level4/session7/flashCross/flashCrossTheme';
import { CrossBodyArrowGame } from '@/components/game/occupational/level4/session7/shared/CrossBodyArrowGame';
import React from 'react';

const FlashCrossGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <CrossBodyArrowGame {...FLASH_CROSS_CONFIG} {...props} />
);

export default FlashCrossGame;
