/** OT Level 4 · Session 5 · Game 4 — Rhythm Switch */
import { RHYTHM_SWITCH_CONFIG } from '@/components/game/occupational/level4/session5/rhythmSwitch/rhythmSwitchTheme';
import { AlternateTapGame } from '@/components/game/occupational/level4/session5/shared/AlternateTapGame';
import React from 'react';

const RhythmSwitchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AlternateTapGame {...RHYTHM_SWITCH_CONFIG} {...props} />
);

export default RhythmSwitchGame;
