import VisualGauntletGame from '@/components/game/occupational/level5/session10/VisualGauntletGame';
import { FOCUS_FORTRESS_CONFIG } from '@/components/game/occupational/level5/session10/focusFortress/focusFortressTheme';
import React from 'react';

const FocusFortressGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VisualGauntletGame {...props} config={FOCUS_FORTRESS_CONFIG} />
);
export default FocusFortressGame;
