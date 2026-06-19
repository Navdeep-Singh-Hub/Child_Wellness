import React from 'react';
import DepthDistanceGame from './DepthDistanceGame';
import { DEPTH_SHRINKING_TARGET } from './depthDistanceConfig';

const DepthShrinkingTargetGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <DepthDistanceGame config={DEPTH_SHRINKING_TARGET} onBack={onBack} onComplete={onComplete} />
);

export default DepthShrinkingTargetGame;
