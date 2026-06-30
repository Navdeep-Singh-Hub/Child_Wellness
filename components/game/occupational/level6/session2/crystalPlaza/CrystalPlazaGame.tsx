/** OT Level 6 · Session 2 · Game 3 — Statue Guard */
import { StandingPostureGame } from '@/components/game/occupational/level6/session2/StandingPostureGame';
import React from 'react';

const StatueGuardGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <StandingPostureGame {...props} mode="statueGuard" />
);

export default StatueGuardGame;
