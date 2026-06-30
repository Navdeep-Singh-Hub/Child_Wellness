/** OT Level 4 · Session 4 · Game 3 — Beat Duo */
import { BEAT_DUO_CONFIG } from '@/components/game/occupational/level4/session4/beatDuo/beatDuoTheme';
import { DualTapGame } from '@/components/game/occupational/level4/session4/shared/DualTapGame';
import React from 'react';

const BeatDuoGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualTapGame {...BEAT_DUO_CONFIG} {...props} />
);

export default BeatDuoGame;
