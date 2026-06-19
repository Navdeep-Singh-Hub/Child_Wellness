import { DragTrackGame } from '@/components/game/occupational/level5/session3/DragTrackGame';
import { ROCKET_DRAG } from '@/components/game/occupational/level5/session3/dragTrackConfig';
import React from 'react';

export default function RocketDragGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <DragTrackGame {...ROCKET_DRAG} {...props} />;
}
