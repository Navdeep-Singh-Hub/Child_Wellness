/** OT Level 4 · Session 8 · Game 3 — Sound Tap */
import { SOUND_TAP_CONFIG } from '@/components/game/occupational/level4/session8/soundTap/soundTapTheme';
import { SideTapGame } from '@/components/game/occupational/level4/session8/shared/SideTapGame';
import React from 'react';

const SoundTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SideTapGame {...SOUND_TAP_CONFIG} {...props} />
);

export default SoundTapGame;
