/** OT Level 6 · Session 4 · Game 1 — Coral Flats */
import { BalanceGame } from '@/components/game/occupational/level6/session4/BalanceGame';
import React from 'react';

const CoralFlatsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BalanceGame {...props} mode="flamingo" />
);

export default CoralFlatsGame;
