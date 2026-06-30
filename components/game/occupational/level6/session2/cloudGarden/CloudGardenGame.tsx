/** OT Level 6 · Session 2 · Game 4 — Grow Taller */
import { StandingPostureGame } from '@/components/game/occupational/level6/session2/StandingPostureGame';
import React from 'react';

const GrowTallerGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <StandingPostureGame {...props} mode="growTaller" />
);

export default GrowTallerGame;
