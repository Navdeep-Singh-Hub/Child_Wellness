/** OT Level 8 · Session 10 · Game 3 — Pirate Treasure Hunt */
import { PraxisAdventureGame } from '@/components/game/occupational/level8/session10/PraxisAdventureGame';
import React from 'react';

const PirateTreasureHuntGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PraxisAdventureGame {...props} mode="pirateTreasureHunt" />
);

export default PirateTreasureHuntGame;
