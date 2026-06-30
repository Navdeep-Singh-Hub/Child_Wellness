/** OT Level 4 · Session 1 · Game 3 — Lane Cross */
import { LANE_CROSS_CONFIG } from '@/components/game/occupational/level4/session1/laneCross/laneCrossTheme';
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/shared/HorizontalDragGame';
import React from 'react';

const LaneCrossGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame {...LANE_CROSS_CONFIG} {...props} />
);

export default LaneCrossGame;
