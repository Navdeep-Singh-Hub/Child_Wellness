/** OT Level 6 · Session 8 · Game 3 — Ice Flow */
import { AnimalWalkGame } from '@/components/game/occupational/level6/session8/AnimalWalkGame';
import React from 'react';

const IceFlowGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AnimalWalkGame {...props} mode="sealPush" />
);

export default IceFlowGame;
