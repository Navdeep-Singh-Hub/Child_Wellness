import React from 'react';
import EyeTrackGame from './EyeTrackGame';
import { SIDE_EYE_TRACK } from './eyeTrackConfig';

const SideEyeTrackGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <EyeTrackGame config={SIDE_EYE_TRACK} onBack={onBack} onComplete={onComplete} />
);

export default SideEyeTrackGame;
