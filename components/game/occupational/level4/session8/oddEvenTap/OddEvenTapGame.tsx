/** OT Level 4 · Session 8 · Game 4 — Odd Even Tap */
import { ODD_EVEN_TAP_CONFIG } from '@/components/game/occupational/level4/session8/oddEvenTap/oddEvenTapTheme';
import { SideTapGame } from '@/components/game/occupational/level4/session8/shared/SideTapGame';
import React from 'react';

const OddEvenTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SideTapGame {...ODD_EVEN_TAP_CONFIG} {...props} />
);

export default OddEvenTapGame;
