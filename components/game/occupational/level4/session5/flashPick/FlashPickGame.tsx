/** OT Level 4 · Session 5 · Game 3 — Flash Pick */
import { FLASH_PICK_CONFIG } from '@/components/game/occupational/level4/session5/flashPick/flashPickTheme';
import { AlternateTapGame } from '@/components/game/occupational/level4/session5/shared/AlternateTapGame';
import React from 'react';

const FlashPickGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AlternateTapGame {...FLASH_PICK_CONFIG} {...props} />
);

export default FlashPickGame;
