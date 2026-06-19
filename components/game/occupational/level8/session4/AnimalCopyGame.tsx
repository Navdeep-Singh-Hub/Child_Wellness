/** OT Level 8 · Session 4 · Game 2 — Animal Copy */
import { ImitationGame } from '@/components/game/occupational/level8/session4/ImitationGame';
import React from 'react';

const AnimalCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ImitationGame {...props} mode="animalCopy" />
);

export default AnimalCopyGame;
