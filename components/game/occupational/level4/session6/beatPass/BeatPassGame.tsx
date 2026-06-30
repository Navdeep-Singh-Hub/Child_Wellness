/** OT Level 4 · Session 6 · Game 4 — Beat Pass */
import { BEAT_PASS_CONFIG } from '@/components/game/occupational/level4/session6/beatPass/beatPassTheme';
import { MidlinePassGame } from '@/components/game/occupational/level4/session6/shared/MidlinePassGame';
import React from 'react';

const BeatPassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MidlinePassGame {...BEAT_PASS_CONFIG} {...props} />
);

export default BeatPassGame;
