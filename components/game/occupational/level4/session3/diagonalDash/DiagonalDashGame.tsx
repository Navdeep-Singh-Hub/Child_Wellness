/** OT Level 4 · Session 3 · Game 1 — Diagonal Dash */
import { DIAGONAL_DASH_CONFIG } from '@/components/game/occupational/level4/session3/diagonalDash/diagonalDashTheme';
import { DiagonalDragGame } from '@/components/game/occupational/level4/session3/shared/DiagonalDragGame';
import React from 'react';

const DiagonalDashGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DiagonalDragGame {...DIAGONAL_DASH_CONFIG} {...props} />
);

export default DiagonalDashGame;
