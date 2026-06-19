import MultiTrackGame from '@/components/game/occupational/level5/session8/MultiTrackGame';
import { TWO_BALLS_CONFIG } from '@/components/game/occupational/level5/session8/multiTrackConfig';
import React from 'react';

const TwoMovingBallsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <MultiTrackGame config={TWO_BALLS_CONFIG} onBack={onBack} onComplete={onComplete} />
);

export default TwoMovingBallsGame;
