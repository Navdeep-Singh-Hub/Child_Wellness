/** OT Level 4 · Session 1 · Game 5 — Quick Drag */
import { QUICK_DRAG_CONFIG } from '@/components/game/occupational/level4/session1/quickDrag/quickDragTheme';
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/shared/HorizontalDragGame';
import React from 'react';

const QuickDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame {...QUICK_DRAG_CONFIG} {...props} />
);

export default QuickDragGame;
