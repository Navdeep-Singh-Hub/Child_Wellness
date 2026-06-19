import SpeedCatchGame from '@/components/game/occupational/level5/session6/SpeedCatchGame';
import { SPEED_SWITCH_CONFIG } from '@/components/game/occupational/level5/session6/speedCatchConfig';
import React from 'react';

const SpeedSwitchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <SpeedCatchGame config={SPEED_SWITCH_CONFIG} onBack={onBack} onComplete={onComplete} />
);

export default SpeedSwitchGame;
