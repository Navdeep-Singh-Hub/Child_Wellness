/** OT Level 8 · Session 10 · Game 5 — Praxis Champion */
import { PraxisAdventureGame } from '@/components/game/occupational/level8/session10/PraxisAdventureGame';
import React from 'react';

const PraxisChampionGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PraxisAdventureGame {...props} mode="praxisChampion" />
);

export default PraxisChampionGame;
