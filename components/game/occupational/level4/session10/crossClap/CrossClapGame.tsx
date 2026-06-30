/** OT Level 4 · Session 10 · Game 1 — Cross Clap */
import { CROSS_CLAP_CONFIG } from '@/components/game/occupational/level4/session10/crossClap/crossClapTheme';
import { RhythmPatternGame } from '@/components/game/occupational/level4/session10/shared/RhythmPatternGame';
import React from 'react';

const CrossClapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmPatternGame {...CROSS_CLAP_CONFIG} {...props} />
);

export default CrossClapGame;
