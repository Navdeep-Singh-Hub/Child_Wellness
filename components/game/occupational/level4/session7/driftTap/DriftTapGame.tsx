/** OT Level 4 · Session 7 · Game 3 — Drift Tap */
import { DRIFT_TAP_CONFIG } from '@/components/game/occupational/level4/session7/driftTap/driftTapTheme';
import { CrossBodyArrowGame } from '@/components/game/occupational/level4/session7/shared/CrossBodyArrowGame';
import React from 'react';

const DriftTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <CrossBodyArrowGame {...DRIFT_TAP_CONFIG} {...props} />
);

export default DriftTapGame;
