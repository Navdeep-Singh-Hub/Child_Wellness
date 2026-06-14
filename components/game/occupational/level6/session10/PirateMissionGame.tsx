/** OT Level 6 · Session 10 · Game 2 — Pirate Mission */
import { IntegratedChallengeGame } from '@/components/game/occupational/level6/session10/IntegratedChallengeGame';
import React from 'react';

const PirateMissionGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <IntegratedChallengeGame {...props} mode="pirateMission" />
);

export default PirateMissionGame;
