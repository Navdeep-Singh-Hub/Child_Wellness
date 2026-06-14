/** OT Level 6 · Session 1 · Game 4 — Sit Tall Freeze */
import { PostureControlGame } from '@/components/game/occupational/level6/session1/PostureControlGame';
import React from 'react';

const SitTallFreezeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureControlGame {...props} mode="freeze" />
);

export default SitTallFreezeGame;
