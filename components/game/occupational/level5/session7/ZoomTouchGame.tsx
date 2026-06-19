import React from 'react';
import DepthDistanceGame from './DepthDistanceGame';
import { ZOOM_TOUCH } from './depthDistanceConfig';

const ZoomTouchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <DepthDistanceGame config={ZOOM_TOUCH} onBack={onBack} onComplete={onComplete} />
);

export default ZoomTouchGame;
