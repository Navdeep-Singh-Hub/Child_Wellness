/** OT Level 5 · Session 1 · Game 4 — Star Hunt */
<<<<<<< HEAD
export { default } from '@/components/game/occupational/level5/session1/starHunt/StarHuntGame';
=======
import StarHuntGame from '@/components/game/occupational/level5/session1/starHunt/StarHuntGame';
import React from 'react';

const ChaseTheStarGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <StarHuntGame {...props} />
);

export default ChaseTheStarGame;
>>>>>>> parent of d0342ff (Revert "fgh")
