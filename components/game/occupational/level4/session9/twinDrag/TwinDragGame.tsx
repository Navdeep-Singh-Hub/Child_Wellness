/** OT Level 4 · Session 9 · Game 1 — Twin Drag */
import { TWIN_DRAG_CONFIG } from '@/components/game/occupational/level4/session9/twinDrag/twinDragTheme';
import { DualDragGame } from '@/components/game/occupational/level4/session9/shared/DualDragGame';
import React from 'react';

const TwinDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualDragGame {...TWIN_DRAG_CONFIG} {...props} />
);

export default TwinDragGame;
