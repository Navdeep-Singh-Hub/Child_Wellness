import { DragTrackGame } from '@/components/game/occupational/level5/session3/DragTrackGame';
import { LIGHTNING_DRAG } from '@/components/game/occupational/level5/session3/dragTrackConfig';
import React from 'react';

export default function LightningDragGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <DragTrackGame {...LIGHTNING_DRAG} {...props} />;
}
