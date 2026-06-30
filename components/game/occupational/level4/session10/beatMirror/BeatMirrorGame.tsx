/** OT Level 4 · Session 10 · Game 3 — Beat Mirror */
import { BEAT_MIRROR_CONFIG } from '@/components/game/occupational/level4/session10/beatMirror/beatMirrorTheme';
import { RhythmPatternGame } from '@/components/game/occupational/level4/session10/shared/RhythmPatternGame';
import React from 'react';

const BeatMirrorGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmPatternGame {...BEAT_MIRROR_CONFIG} {...props} />
);

export default BeatMirrorGame;
