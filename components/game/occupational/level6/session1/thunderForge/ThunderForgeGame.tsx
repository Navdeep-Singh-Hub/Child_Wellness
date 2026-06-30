/** OT Level 6 · Session 1 · Game 1 — Superhero Power Sit */
import { PostureControlGame } from '@/components/game/occupational/level6/session1/PostureControlGame';
import React from 'react';

const SuperheroPowerSitGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureControlGame {...props} mode="powerSit" />
);

export default SuperheroPowerSitGame;
