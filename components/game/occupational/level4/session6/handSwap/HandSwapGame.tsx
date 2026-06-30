/** OT Level 4 · Session 6 · Game 1 — Hand Swap */
import { HAND_SWAP_CONFIG } from '@/components/game/occupational/level4/session6/handSwap/handSwapTheme';
import { MidlinePassGame } from '@/components/game/occupational/level4/session6/shared/MidlinePassGame';
import React from 'react';

const HandSwapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MidlinePassGame {...HAND_SWAP_CONFIG} {...props} />
);

export default HandSwapGame;
