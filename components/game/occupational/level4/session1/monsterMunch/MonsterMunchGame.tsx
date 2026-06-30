/** OT Level 4 · Session 1 · Game 2 — Monster Munch */
import { MONSTER_MUNCH_CONFIG } from '@/components/game/occupational/level4/session1/monsterMunch/monsterMunchTheme';
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/shared/HorizontalDragGame';
import React from 'react';

const MonsterMunchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame {...MONSTER_MUNCH_CONFIG} {...props} />
);

export default MonsterMunchGame;
