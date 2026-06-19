import React from 'react';
import DepthDistanceGame from './DepthDistanceGame';
import { THREE_LAYER_TAP } from './depthDistanceConfig';

const ThreeLayerTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <DepthDistanceGame config={THREE_LAYER_TAP} onBack={onBack} onComplete={onComplete} />
);

export default ThreeLayerTapGame;
