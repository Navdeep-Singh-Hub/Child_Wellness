/** OT Level 6 · Session 9 · Game 5 — Marble Plaza */
import { PosturalEnduranceGame } from '@/components/game/occupational/level6/session9/PosturalEnduranceGame';
import React from 'react';

const MarblePlazaGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PosturalEnduranceGame {...props} mode="longestStatue" />
);

export default MarblePlazaGame;
