import VisualGauntletGame from '@/components/game/occupational/level5/session10/VisualGauntletGame';
import { STORM_RELAY_CONFIG } from '@/components/game/occupational/level5/session10/stormRelay/stormRelayTheme';
import React from 'react';

const StormRelayGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VisualGauntletGame {...props} config={STORM_RELAY_CONFIG} />
);
export default StormRelayGame;
