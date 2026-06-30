/** OT Level 4 · Session 5 · Game 5 — Speed Switch */
import { SPEED_SWITCH_CONFIG } from '@/components/game/occupational/level4/session5/speedSwitch/speedSwitchTheme';
import { AlternateTapGame } from '@/components/game/occupational/level4/session5/shared/AlternateTapGame';
import React from 'react';

const SpeedSwitchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AlternateTapGame {...SPEED_SWITCH_CONFIG} {...props} />
);

export default SpeedSwitchGame;
