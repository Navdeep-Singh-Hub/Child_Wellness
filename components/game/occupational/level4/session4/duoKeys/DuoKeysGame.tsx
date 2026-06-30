/** OT Level 4 · Session 4 · Game 2 — Duo Keys */
import { DUO_KEYS_CONFIG } from '@/components/game/occupational/level4/session4/duoKeys/duoKeysTheme';
import { DualTapGame } from '@/components/game/occupational/level4/session4/shared/DualTapGame';
import React from 'react';

const DuoKeysGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualTapGame {...DUO_KEYS_CONFIG} {...props} />
);

export default DuoKeysGame;
