/** OT Level 7 · Session 3 · Game 4 — Turn Around Quest */
import { DirectionChangeGame } from '@/components/game/occupational/level7/session3/DirectionChangeGame';
import React from 'react';

const TurnAroundQuestGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DirectionChangeGame {...props} mode="turnAroundQuest" />
);

export default TurnAroundQuestGame;
