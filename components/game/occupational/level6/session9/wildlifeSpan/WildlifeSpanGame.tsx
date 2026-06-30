/** OT Level 6 · Session 9 · Game 3 — Wildlife Span */
import { PosturalEnduranceGame } from '@/components/game/occupational/level6/session9/PosturalEnduranceGame';
import React from 'react';

const WildlifeSpanGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PosturalEnduranceGame {...props} mode="bridgeHold" />
);

export default WildlifeSpanGame;
