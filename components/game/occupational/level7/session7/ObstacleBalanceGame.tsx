import { BalanceReactionGame } from '@/components/game/occupational/level7/session7/BalanceReactionGame';
import React from 'react';

export default function ObstacleBalanceGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <BalanceReactionGame mode="obstacleBalance" {...props} />;
}
