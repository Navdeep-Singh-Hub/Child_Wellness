import VisualGauntletGame from '@/components/game/occupational/level5/session10/VisualGauntletGame';
import { CANYON_RALLY_CONFIG } from '@/components/game/occupational/level5/session10/canyonRally/canyonRallyTheme';
import React from 'react';

const CanyonRallyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VisualGauntletGame {...props} config={CANYON_RALLY_CONFIG} />
);
export default CanyonRallyGame;
