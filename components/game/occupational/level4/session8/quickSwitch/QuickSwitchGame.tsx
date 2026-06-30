/** OT Level 4 · Session 8 · Game 5 — Quick Switch */
import { QUICK_SWITCH_CONFIG } from '@/components/game/occupational/level4/session8/quickSwitch/quickSwitchTheme';
import { SideTapGame } from '@/components/game/occupational/level4/session8/shared/SideTapGame';
import React from 'react';

const QuickSwitchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SideTapGame {...QUICK_SWITCH_CONFIG} {...props} />
);

export default QuickSwitchGame;
