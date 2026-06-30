/** OT Level 4 · Session 4 · Game 1 — Twin Tap */
import { TWIN_TAP_CONFIG } from '@/components/game/occupational/level4/session4/twinTap/twinTapTheme';
import { DualTapGame } from '@/components/game/occupational/level4/session4/shared/DualTapGame';
import React from 'react';

const TwinTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualTapGame {...TWIN_TAP_CONFIG} {...props} />
);

export default TwinTapGame;
