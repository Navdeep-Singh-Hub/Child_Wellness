import VisualGauntletGame from '@/components/game/occupational/level5/session10/VisualGauntletGame';
import { FOCUS_RELAY_CONFIG } from '@/components/game/occupational/level5/session10/visualGauntletConfig';
import React from 'react';

const FocusRelayGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VisualGauntletGame {...props} config={FOCUS_RELAY_CONFIG} />
);
export default FocusRelayGame;
