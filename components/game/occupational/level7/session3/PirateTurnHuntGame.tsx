/** OT Level 7 · Session 3 · Game 3 — Pirate Turn Hunt */
import { DirectionChangeGame } from '@/components/game/occupational/level7/session3/DirectionChangeGame';
import React from 'react';

const PirateTurnHuntGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DirectionChangeGame {...props} mode="pirateTurnHunt" />
);

export default PirateTurnHuntGame;
