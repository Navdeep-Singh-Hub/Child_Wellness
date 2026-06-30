/** OT Level 4 · Session 9 · Game 2 — Pair Match */
import { PAIR_MATCH_CONFIG } from '@/components/game/occupational/level4/session9/pairMatch/pairMatchTheme';
import { DualDragGame } from '@/components/game/occupational/level4/session9/shared/DualDragGame';
import React from 'react';

const PairMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualDragGame {...PAIR_MATCH_CONFIG} {...props} />
);

export default PairMatchGame;
