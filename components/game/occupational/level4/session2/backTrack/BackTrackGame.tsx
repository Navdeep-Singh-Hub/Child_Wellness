/** OT Level 4 · Session 2 · Game 3 — Back Track */
import { BACK_TRACK_CONFIG } from '@/components/game/occupational/level4/session2/backTrack/backTrackTheme';
import { ReversePathDragGame } from '@/components/game/occupational/level4/session2/shared/ReversePathDragGame';
import React from 'react';

const BackTrackGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReversePathDragGame {...BACK_TRACK_CONFIG} {...props} />
);

export default BackTrackGame;
