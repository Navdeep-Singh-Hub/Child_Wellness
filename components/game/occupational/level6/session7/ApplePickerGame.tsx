/** OT Level 6 · Session 7 · Game 1 — Apple Picker */
import { TrunkRotationGame } from '@/components/game/occupational/level6/session7/TrunkRotationGame';
import React from 'react';

const ApplePickerGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <TrunkRotationGame {...props} mode="applePicker" />
);

export default ApplePickerGame;
