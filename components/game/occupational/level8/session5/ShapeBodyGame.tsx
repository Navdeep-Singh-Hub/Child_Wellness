/** OT Level 8 · Session 5 · Game 5 — Shape Body */
import { BodyPositionGame } from '@/components/game/occupational/level8/session5/BodyPositionGame';
import React from 'react';

const ShapeBodyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyPositionGame {...props} mode="shapeBody" />
);

export default ShapeBodyGame;
