/** OT Level 4 · Session 6 · Game 3 — Aim Pass */
import { AIM_PASS_CONFIG } from '@/components/game/occupational/level4/session6/aimPass/aimPassTheme';
import { MidlineDragPassGame } from '@/components/game/occupational/level4/session6/shared/MidlineDragPassGame';
import React from 'react';

const AimPassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MidlineDragPassGame {...AIM_PASS_CONFIG} {...props} />
);

export default AimPassGame;
