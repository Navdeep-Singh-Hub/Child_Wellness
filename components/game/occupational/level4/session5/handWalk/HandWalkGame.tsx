/** OT Level 4 · Session 5 · Game 2 — Hand Walk */
import { HAND_WALK_CONFIG } from '@/components/game/occupational/level4/session5/handWalk/handWalkTheme';
import { AlternateTapGame } from '@/components/game/occupational/level4/session5/shared/AlternateTapGame';
import React from 'react';

const HandWalkGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AlternateTapGame {...HAND_WALK_CONFIG} {...props} />
);

export default HandWalkGame;
