/** OT Level 6 · Session 7 · Game 5 — Polaris Sweep */
import { TrunkRotationGame } from '@/components/game/occupational/level6/session7/TrunkRotationGame';
import React from 'react';

const PolarisSweepGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <TrunkRotationGame {...props} mode="twistingStarHunt" />
);

export default PolarisSweepGame;
