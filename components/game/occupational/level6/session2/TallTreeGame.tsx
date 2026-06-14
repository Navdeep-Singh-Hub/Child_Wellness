/** OT Level 6 · Session 2 · Game 1 — Tall Tree */
import { StandingPostureGame } from '@/components/game/occupational/level6/session2/StandingPostureGame';
import React from 'react';

const TallTreeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <StandingPostureGame {...props} mode="tallTree" />
);

export default TallTreeGame;
