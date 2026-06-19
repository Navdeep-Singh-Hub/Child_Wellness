/** OT Level 8 · Session 4 · Game 3 — Dance Mirror */
import { ImitationGame } from '@/components/game/occupational/level8/session4/ImitationGame';
import React from 'react';

const DanceMirrorGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ImitationGame {...props} mode="danceMirror" />
);

export default DanceMirrorGame;
