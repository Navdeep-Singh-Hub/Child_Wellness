import { DragTrackGame } from '@/components/game/occupational/level5/session3/DragTrackGame';
import { TRAIN_TRACK } from '@/components/game/occupational/level5/session3/dragTrackConfig';
import React from 'react';

export default function TrainTrackDragGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <DragTrackGame {...TRAIN_TRACK} {...props} />;
}
