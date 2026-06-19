import React from 'react';
import DepthDistanceGame from './DepthDistanceGame';
import { FALLING_OBJECTS } from './depthDistanceConfig';

const FallingObjectsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <DepthDistanceGame config={FALLING_OBJECTS} onBack={onBack} onComplete={onComplete} />
);

export default FallingObjectsGame;
