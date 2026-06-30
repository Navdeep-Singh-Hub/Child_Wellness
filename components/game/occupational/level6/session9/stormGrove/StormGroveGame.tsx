/** OT Level 6 · Session 9 · Game 4 — Storm Grove */
import { PosturalEnduranceGame } from '@/components/game/occupational/level6/session9/PosturalEnduranceGame';
import React from 'react';

const StormGroveGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PosturalEnduranceGame {...props} mode="tallTreeChallenge" />
);

export default StormGroveGame;
