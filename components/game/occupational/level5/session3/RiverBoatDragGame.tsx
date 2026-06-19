import { DragTrackGame } from '@/components/game/occupational/level5/session3/DragTrackGame';
import { RIVER_BOAT } from '@/components/game/occupational/level5/session3/dragTrackConfig';
import React from 'react';

export default function RiverBoatDragGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <DragTrackGame {...RIVER_BOAT} {...props} />;
}
