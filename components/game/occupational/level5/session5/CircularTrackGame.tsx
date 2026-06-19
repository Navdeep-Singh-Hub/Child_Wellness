import React from 'react';
import EyeTrackGame from './EyeTrackGame';
import { CIRCULAR_TRACK } from './eyeTrackConfig';

const CircularTrackGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <EyeTrackGame config={CIRCULAR_TRACK} onBack={onBack} onComplete={onComplete} />
);

export default CircularTrackGame;
