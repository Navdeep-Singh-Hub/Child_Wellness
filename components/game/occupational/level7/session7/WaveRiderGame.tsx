import { BalanceReactionGame } from '@/components/game/occupational/level7/session7/BalanceReactionGame';
import React from 'react';

export default function WaveRiderGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <BalanceReactionGame mode="waveRider" {...props} />;
}
