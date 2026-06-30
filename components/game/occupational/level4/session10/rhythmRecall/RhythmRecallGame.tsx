/** OT Level 4 · Session 10 · Game 4 — Rhythm Recall */
import { RHYTHM_RECALL_CONFIG } from '@/components/game/occupational/level4/session10/rhythmRecall/rhythmRecallTheme';
import { RhythmPatternGame } from '@/components/game/occupational/level4/session10/shared/RhythmPatternGame';
import React from 'react';

const RhythmRecallGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmPatternGame {...RHYTHM_RECALL_CONFIG} {...props} />
);

export default RhythmRecallGame;
