/** OT Level 8 · Session 10 · Game 1 — Jungle Expedition */
import { PraxisAdventureGame } from '@/components/game/occupational/level8/session10/PraxisAdventureGame';
import React from 'react';

const JungleExpeditionPraxisGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PraxisAdventureGame {...props} mode="jungleExpedition" />
);

export default JungleExpeditionPraxisGame;
