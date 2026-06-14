/** OT Level 6 · Session 10 · Game 5 — OT Obstacle Course (Grand Finale) */
import { IntegratedChallengeGame } from '@/components/game/occupational/level6/session10/IntegratedChallengeGame';
import React from 'react';

const OTObstacleCourseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <IntegratedChallengeGame {...props} mode="otObstacleCourse" />
);

export default OTObstacleCourseGame;
