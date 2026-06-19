import SpeedCatchGame from '@/components/game/occupational/level5/session6/SpeedCatchGame';
import { SLOW_CATCH_CONFIG } from '@/components/game/occupational/level5/session6/speedCatchConfig';
import React from 'react';

const SlowCatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <SpeedCatchGame config={SLOW_CATCH_CONFIG} onBack={onBack} onComplete={onComplete} />
);

export default SlowCatchGame;
