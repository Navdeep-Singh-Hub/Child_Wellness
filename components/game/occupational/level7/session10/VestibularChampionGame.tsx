import { VestibularChallengeGame } from '@/components/game/occupational/level7/session10/VestibularChallengeGame';
import React from 'react';

export default function VestibularChampionGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <VestibularChallengeGame mode="vestibularChampion" {...props} />;
}
