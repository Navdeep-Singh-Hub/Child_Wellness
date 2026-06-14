import { BalanceReactionGame } from '@/components/game/occupational/level7/session7/BalanceReactionGame';
import React from 'react';

export default function RecoveryMasterGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <BalanceReactionGame mode="recoveryMaster" {...props} />;
}
