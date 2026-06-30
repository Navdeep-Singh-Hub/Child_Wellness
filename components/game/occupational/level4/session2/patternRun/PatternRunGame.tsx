/** OT Level 4 · Session 2 · Game 5 — Pattern Run */
import { PATTERN_RUN_CONFIG } from '@/components/game/occupational/level4/session2/patternRun/patternRunTheme';
import { ReversePathDragGame } from '@/components/game/occupational/level4/session2/shared/ReversePathDragGame';
import React from 'react';

const PatternRunGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReversePathDragGame {...PATTERN_RUN_CONFIG} {...props} />
);

export default PatternRunGame;
