import { VestibularEnduranceGame } from '@/components/game/occupational/level7/session9/VestibularEnduranceGame';
import React from 'react';

export default function ForestExplorerGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <VestibularEnduranceGame mode="forestExplorer" {...props} />;
}
