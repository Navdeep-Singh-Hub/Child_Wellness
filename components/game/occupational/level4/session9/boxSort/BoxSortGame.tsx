/** OT Level 4 · Session 9 · Game 3 — Box Sort */
import { BOX_SORT_CONFIG } from '@/components/game/occupational/level4/session9/boxSort/boxSortTheme';
import { DualDragGame } from '@/components/game/occupational/level4/session9/shared/DualDragGame';
import React from 'react';

const BoxSortGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualDragGame {...BOX_SORT_CONFIG} {...props} />
);

export default BoxSortGame;
