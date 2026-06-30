/** OT Level 4 · Session 7 · Game 4 — Arrow Chain */
import { ARROW_CHAIN_CONFIG } from '@/components/game/occupational/level4/session7/arrowChain/arrowChainTheme';
import { CrossBodySequenceGame } from '@/components/game/occupational/level4/session7/shared/CrossBodySequenceGame';
import React from 'react';

const ArrowChainGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <CrossBodySequenceGame {...ARROW_CHAIN_CONFIG} {...props} />
);

export default ArrowChainGame;
