import { DynamicStandingBalanceGame } from '@/components/game/occupational/level7/session5/DynamicStandingBalanceGame';
import React from 'react';

export default function IslandHopperGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <DynamicStandingBalanceGame mode="islandHopper" {...props} />;
}
