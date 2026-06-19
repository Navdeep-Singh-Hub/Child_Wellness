import React from 'react';
import DepthDistanceGame from './DepthDistanceGame';
import { NEAR_VS_FAR } from './depthDistanceConfig';

const NearVsFarGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <DepthDistanceGame config={NEAR_VS_FAR} onBack={onBack} onComplete={onComplete} />
);

export default NearVsFarGame;
