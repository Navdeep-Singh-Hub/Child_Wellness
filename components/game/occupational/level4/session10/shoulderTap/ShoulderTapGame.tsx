/** OT Level 4 · Session 10 · Game 2 — Shoulder Tap */
import { SHOULDER_TAP_CONFIG } from '@/components/game/occupational/level4/session10/shoulderTap/shoulderTapTheme';
import { RhythmPatternGame } from '@/components/game/occupational/level4/session10/shared/RhythmPatternGame';
import React from 'react';

const ShoulderTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmPatternGame {...SHOULDER_TAP_CONFIG} {...props} />
);

export default ShoulderTapGame;
