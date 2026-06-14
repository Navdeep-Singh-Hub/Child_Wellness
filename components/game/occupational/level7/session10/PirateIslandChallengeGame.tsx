import { VestibularChallengeGame } from '@/components/game/occupational/level7/session10/VestibularChallengeGame';
import React from 'react';

export default function PirateIslandChallengeGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <VestibularChallengeGame mode="pirateIsland" {...props} />;
}
