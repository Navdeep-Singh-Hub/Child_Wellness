import React from 'react';
import EyeTrackGame from './EyeTrackGame';
import { UP_DOWN_TRACK } from './eyeTrackConfig';

const UpDownTrackGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <EyeTrackGame config={UP_DOWN_TRACK} onBack={onBack} onComplete={onComplete} />
);

export default UpDownTrackGame;
