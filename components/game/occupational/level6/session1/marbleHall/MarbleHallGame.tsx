/** OT Level 6 · Session 1 · Game 3 — Statue Kingdom */
import { PostureControlGame } from '@/components/game/occupational/level6/session1/PostureControlGame';
import React from 'react';

const StatueKingdomGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureControlGame {...props} mode="statue" />
);

export default StatueKingdomGame;
