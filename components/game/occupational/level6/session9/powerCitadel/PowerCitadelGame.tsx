/** OT Level 6 · Session 9 · Game 1 — Power Citadel */
import { PosturalEnduranceGame } from '@/components/game/occupational/level6/session9/PosturalEnduranceGame';
import React from 'react';

const PowerCitadelGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PosturalEnduranceGame {...props} mode="superheroHold" />
);

export default PowerCitadelGame;
