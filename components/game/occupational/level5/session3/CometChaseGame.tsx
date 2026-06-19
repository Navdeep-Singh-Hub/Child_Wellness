import { DragTrackGame } from '@/components/game/occupational/level5/session3/DragTrackGame';
import { COMET_CHASE } from '@/components/game/occupational/level5/session3/dragTrackConfig';
import React from 'react';

export default function CometChaseGame(props: { onBack?: () => void; onComplete?: () => void }) {
  return <DragTrackGame {...COMET_CHASE} {...props} />;
}
