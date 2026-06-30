/** OT Level 4 · Session 10 · Game 5 — Fast Beat */
import { FAST_BEAT_CONFIG } from '@/components/game/occupational/level4/session10/fastBeat/fastBeatTheme';
import { RhythmPatternGame } from '@/components/game/occupational/level4/session10/shared/RhythmPatternGame';
import React from 'react';

const FastBeatGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmPatternGame {...FAST_BEAT_CONFIG} {...props} />
);

export default FastBeatGame;
