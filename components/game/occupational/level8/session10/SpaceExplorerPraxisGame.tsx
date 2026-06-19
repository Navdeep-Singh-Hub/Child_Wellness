/** OT Level 8 · Session 10 · Game 2 — Space Explorer */
import { PraxisAdventureGame } from '@/components/game/occupational/level8/session10/PraxisAdventureGame';
import React from 'react';

const SpaceExplorerPraxisGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PraxisAdventureGame {...props} mode="spaceExplorer" />
);

export default SpaceExplorerPraxisGame;
