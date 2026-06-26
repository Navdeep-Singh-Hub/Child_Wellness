/** OT Level 5 · Session 1 · Game 3 — Safe Tap */
import SafeTapGame from '@/components/game/occupational/level5/session1/safeTap/SafeTapGame';
import React from 'react';

const AvoidTheBombGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SafeTapGame {...props} />
);

export default AvoidTheBombGame;
