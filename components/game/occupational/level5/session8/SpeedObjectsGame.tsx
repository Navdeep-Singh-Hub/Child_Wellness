import MultiTrackGame from '@/components/game/occupational/level5/session8/MultiTrackGame';
import { SPEED_OBJECTS_CONFIG } from '@/components/game/occupational/level5/session8/multiTrackConfig';
import React from 'react';

const SpeedObjectsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <MultiTrackGame config={SPEED_OBJECTS_CONFIG} onBack={onBack} onComplete={onComplete} />
);

export default SpeedObjectsGame;
