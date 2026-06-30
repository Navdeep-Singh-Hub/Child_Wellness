/** OT Level 4 · Session 3 · Game 5 — Corner Match */
import { CORNER_MATCH_CONFIG } from '@/components/game/occupational/level4/session3/cornerMatch/cornerMatchTheme';
import { DiagonalDragGame } from '@/components/game/occupational/level4/session3/shared/DiagonalDragGame';
import React from 'react';

const CornerMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DiagonalDragGame {...CORNER_MATCH_CONFIG} {...props} />
);

export default CornerMatchGame;
