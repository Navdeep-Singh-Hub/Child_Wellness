import VisualGauntletGame from '@/components/game/occupational/level5/session10/VisualGauntletGame';
import { PURSUIT_COMBO_CONFIG } from '@/components/game/occupational/level5/session10/visualGauntletConfig';
import React from 'react';

const PursuitComboGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VisualGauntletGame {...props} config={PURSUIT_COMBO_CONFIG} />
);
export default PursuitComboGame;
