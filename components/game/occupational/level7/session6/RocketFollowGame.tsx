import { VisualVestibularGame } from '@/components/game/occupational/level7/session6/VisualVestibularGame';
import React from 'react';

export default function RocketFollowGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <VisualVestibularGame mode="rocketFollow" {...props} />;
}
