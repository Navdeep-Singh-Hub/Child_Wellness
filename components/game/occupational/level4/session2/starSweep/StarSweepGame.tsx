/** OT Level 4 · Session 2 · Game 2 — Star Sweep */
import { STAR_SWEEP_CONFIG } from '@/components/game/occupational/level4/session2/starSweep/starSweepTheme';
import { ReverseHorizontalDragGame } from '@/components/game/occupational/level4/session2/shared/ReverseHorizontalDragGame';
import React from 'react';

const StarSweepGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReverseHorizontalDragGame {...STAR_SWEEP_CONFIG} {...props} />
);

export default StarSweepGame;
