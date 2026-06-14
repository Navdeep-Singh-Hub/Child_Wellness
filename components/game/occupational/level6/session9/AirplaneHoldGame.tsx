/** OT Level 6 · Session 9 · Game 2 — Airplane Hold */
import { PosturalEnduranceGame } from '@/components/game/occupational/level6/session9/PosturalEnduranceGame';
import React from 'react';

const AirplaneHoldGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PosturalEnduranceGame {...props} mode="airplaneHold" />
);

export default AirplaneHoldGame;
