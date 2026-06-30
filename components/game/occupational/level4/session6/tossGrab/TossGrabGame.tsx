/** OT Level 4 · Session 6 · Game 2 — Toss & Grab */
import { TOSS_GRAB_CONFIG } from '@/components/game/occupational/level4/session6/tossGrab/tossGrabTheme';
import { MidlinePassGame } from '@/components/game/occupational/level4/session6/shared/MidlinePassGame';
import React from 'react';

const TossGrabGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MidlinePassGame {...TOSS_GRAB_CONFIG} {...props} />
);

export default TossGrabGame;
