/** OT Level 4 · Session 9 · Game 5 — Even Pull */
import { EVEN_PULL_CONFIG } from '@/components/game/occupational/level4/session9/evenPull/evenPullTheme';
import { BalanceDualDragGame } from '@/components/game/occupational/level4/session9/shared/BalanceDualDragGame';
import React from 'react';

const EvenPullGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BalanceDualDragGame {...EVEN_PULL_CONFIG} {...props} />
);

export default EvenPullGame;
