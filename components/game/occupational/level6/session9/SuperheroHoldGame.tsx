/** OT Level 6 · Session 9 · Game 1 — Superhero Hold */
import { PosturalEnduranceGame } from '@/components/game/occupational/level6/session9/PosturalEnduranceGame';
import React from 'react';

const SuperheroHoldGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PosturalEnduranceGame {...props} mode="superheroHold" />
);

export default SuperheroHoldGame;
