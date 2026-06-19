import SpeedCatchGame from '@/components/game/occupational/level5/session6/SpeedCatchGame';
import { FAST_CATCH_CONFIG } from '@/components/game/occupational/level5/session6/speedCatchConfig';
import React from 'react';

const FastCatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <SpeedCatchGame config={FAST_CATCH_CONFIG} onBack={onBack} onComplete={onComplete} />
);

export default FastCatchGame;
