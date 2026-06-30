/** OT Level 4 · Session 4 · Game 4 — Flash Tap */
import { FLASH_TAP_CONFIG } from '@/components/game/occupational/level4/session4/flashTap/flashTapTheme';
import { DualTapGame } from '@/components/game/occupational/level4/session4/shared/DualTapGame';
import React from 'react';

const FlashTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualTapGame {...FLASH_TAP_CONFIG} {...props} />
);

export default FlashTapGame;
