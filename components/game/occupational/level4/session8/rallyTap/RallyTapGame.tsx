/** OT Level 4 · Session 8 · Game 2 — Rally Tap */
import { RALLY_TAP_CONFIG } from '@/components/game/occupational/level4/session8/rallyTap/rallyTapTheme';
import { SidePingPongGame } from '@/components/game/occupational/level4/session8/shared/SidePingPongGame';
import React from 'react';

const RallyTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SidePingPongGame {...RALLY_TAP_CONFIG} {...props} />
);

export default RallyTapGame;
