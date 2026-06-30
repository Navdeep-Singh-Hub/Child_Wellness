/** OT Level 5 · Session 1 · Game 5 — Zigzag Run */
<<<<<<< HEAD
export { default } from '@/components/game/occupational/level5/session1/zigzagRun/ZigzagRunGame';
=======
import ZigzagRunGame from '@/components/game/occupational/level5/session1/zigzagRun/ZigzagRunGame';
import React from 'react';

const ZigZagFollowGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ZigzagRunGame {...props} />
);

export default ZigZagFollowGame;
>>>>>>> parent of d0342ff (Revert "fgh")
