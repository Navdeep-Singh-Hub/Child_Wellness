import { DynamicStandingBalanceGame } from '@/components/game/occupational/level7/session5/DynamicStandingBalanceGame';
import React from 'react';

export default function RiverCrossingL7Game(props: { onBack?: () => void; onComplete?: () => void }) {
  return <DynamicStandingBalanceGame mode="riverCrossing" {...props} />;
}
