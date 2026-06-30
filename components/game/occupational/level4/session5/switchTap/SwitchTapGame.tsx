/** OT Level 4 · Session 5 · Game 1 — Switch Tap */
import { SWITCH_TAP_CONFIG } from '@/components/game/occupational/level4/session5/switchTap/switchTapTheme';
import { AlternateTapGame } from '@/components/game/occupational/level4/session5/shared/AlternateTapGame';
import React from 'react';

const SwitchTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AlternateTapGame {...SWITCH_TAP_CONFIG} {...props} />
);

export default SwitchTapGame;
