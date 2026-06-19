/** OT Level 8 · Session 10 · Game 4 — Mountain Mission */
import { PraxisAdventureGame } from '@/components/game/occupational/level8/session10/PraxisAdventureGame';
import React from 'react';

const MountainMissionGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PraxisAdventureGame {...props} mode="mountainMission" />
);

export default MountainMissionGame;
