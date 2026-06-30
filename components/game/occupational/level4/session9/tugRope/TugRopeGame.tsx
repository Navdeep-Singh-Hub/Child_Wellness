/** OT Level 4 · Session 9 · Game 4 — Tug Rope */
import { TUG_ROPE_CONFIG } from '@/components/game/occupational/level4/session9/tugRope/tugRopeTheme';
import { DualPullGame } from '@/components/game/occupational/level4/session9/shared/DualPullGame';
import React from 'react';

const TugRopeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualPullGame {...TUG_ROPE_CONFIG} {...props} />
);

export default TugRopeGame;
