/** OT Level 4 · Session 6 · Game 5 — Detour Pass */
import { DETOUR_PASS_CONFIG } from '@/components/game/occupational/level4/session6/detourPass/detourPassTheme';
import { MidlineDragPassGame } from '@/components/game/occupational/level4/session6/shared/MidlineDragPassGame';
import React from 'react';

const DetourPassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MidlineDragPassGame {...DETOUR_PASS_CONFIG} {...props} />
);

export default DetourPassGame;
