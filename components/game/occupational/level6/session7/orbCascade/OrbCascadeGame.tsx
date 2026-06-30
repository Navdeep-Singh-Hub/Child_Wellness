/** OT Level 6 · Session 7 · Game 4 — Orb Cascade */
import { TrunkRotationGame } from '@/components/game/occupational/level6/session7/TrunkRotationGame';
import React from 'react';

const OrbCascadeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <TrunkRotationGame {...props} mode="crossBodyCatch" />
);

export default OrbCascadeGame;
