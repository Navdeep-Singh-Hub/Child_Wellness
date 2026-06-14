import { DynamicStandingBalanceGame } from '@/components/game/occupational/level7/session5/DynamicStandingBalanceGame';
import React from 'react';

export default function StarTrailGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <DynamicStandingBalanceGame mode="starTrail" {...props} />;
}
