import VisualGauntletGame from '@/components/game/occupational/level5/session10/VisualGauntletGame';
import { COMET_CHASE_CONFIG } from '@/components/game/occupational/level5/session10/cometChase/cometChaseTheme';
import React from 'react';

const CometChaseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VisualGauntletGame {...props} config={COMET_CHASE_CONFIG} />
);
export default CometChaseGame;
