/** OT Level 4 · Session 3 · Game 4 — Zigzag Run */
import { ZIGZAG_RUN_CONFIG } from '@/components/game/occupational/level4/session3/zigzagRun/zigzagRunTheme';
import { DiagonalPathDragGame } from '@/components/game/occupational/level4/session3/shared/DiagonalPathDragGame';
import React from 'react';

const ZigzagRunGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DiagonalPathDragGame {...ZIGZAG_RUN_CONFIG} {...props} />
);

export default ZigzagRunGame;
