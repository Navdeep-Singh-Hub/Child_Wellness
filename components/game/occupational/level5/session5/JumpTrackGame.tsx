import React from 'react';
import EyeTrackGame from './EyeTrackGame';
import { JUMP_TRACK } from './eyeTrackConfig';

const JumpTrackGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <EyeTrackGame config={JUMP_TRACK} onBack={onBack} onComplete={onComplete} />
);

export default JumpTrackGame;
