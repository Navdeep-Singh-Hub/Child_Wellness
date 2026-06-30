/** OT Level 4 · Session 2 · Game 1 — Return Pass */
import { RETURN_PASS_CONFIG } from '@/components/game/occupational/level4/session2/returnPass/returnPassTheme';
import { ReverseHorizontalDragGame } from '@/components/game/occupational/level4/session2/shared/ReverseHorizontalDragGame';
import React from 'react';

const ReturnPassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReverseHorizontalDragGame {...RETURN_PASS_CONFIG} {...props} />
);

export default ReturnPassGame;
