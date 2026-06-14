/** OT Level 7 · Session 3 · Game 2 — Go Left Go Right */
import { DirectionChangeGame } from '@/components/game/occupational/level7/session3/DirectionChangeGame';
import React from 'react';

const GoLeftGoRightGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DirectionChangeGame {...props} mode="goLeftGoRight" />
);

export default GoLeftGoRightGame;
