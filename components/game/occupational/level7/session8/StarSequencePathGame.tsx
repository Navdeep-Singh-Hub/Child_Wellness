import { VestibularSequencingGame } from '@/components/game/occupational/level7/session8/VestibularSequencingGame';
import React from 'react';

export default function StarSequencePathGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <VestibularSequencingGame mode="starSequencePath" {...props} />;
}
