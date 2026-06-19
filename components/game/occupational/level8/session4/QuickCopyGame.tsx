/** OT Level 8 · Session 4 · Game 5 — Quick Copy */
import { ImitationGame } from '@/components/game/occupational/level8/session4/ImitationGame';
import React from 'react';

const QuickCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ImitationGame {...props} mode="quickCopy" />
);

export default QuickCopyGame;
