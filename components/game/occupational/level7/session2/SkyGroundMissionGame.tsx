/** OT Level 7 · Session 2 · Game 2 — Sky-Ground Mission */
import { VestibularHeadGame } from '@/components/game/occupational/level7/session2/VestibularHeadGame';
import React from 'react';

const SkyGroundMissionGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VestibularHeadGame {...props} mode="skyGroundMission" />
);

export default SkyGroundMissionGame;
