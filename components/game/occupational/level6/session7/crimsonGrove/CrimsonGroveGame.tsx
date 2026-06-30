/** OT Level 6 · Session 7 · Game 1 — Crimson Grove */
import { TrunkRotationGame } from '@/components/game/occupational/level6/session7/TrunkRotationGame';
import React from 'react';

const CrimsonGroveGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <TrunkRotationGame {...props} mode="applePicker" />
);

export default CrimsonGroveGame;
