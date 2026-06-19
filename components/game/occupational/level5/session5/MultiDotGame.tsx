import React from 'react';
import EyeTrackGame from './EyeTrackGame';
import { MULTI_DOT } from './eyeTrackConfig';

const MultiDotGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <EyeTrackGame config={MULTI_DOT} onBack={onBack} onComplete={onComplete} />
);

export default MultiDotGame;
