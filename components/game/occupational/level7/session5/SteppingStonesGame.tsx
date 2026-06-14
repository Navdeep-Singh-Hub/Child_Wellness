import { DynamicStandingBalanceGame } from '@/components/game/occupational/level7/session5/DynamicStandingBalanceGame';
import React from 'react';

export default function SteppingStonesGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <DynamicStandingBalanceGame mode="steppingStones" {...props} />;
}
