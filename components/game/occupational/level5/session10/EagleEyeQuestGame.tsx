import VisualGauntletGame from '@/components/game/occupational/level5/session10/VisualGauntletGame';
import { EAGLE_EYE_CONFIG } from '@/components/game/occupational/level5/session10/visualGauntletConfig';
import React from 'react';

const EagleEyeQuestGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VisualGauntletGame {...props} config={EAGLE_EYE_CONFIG} />
);
export default EagleEyeQuestGame;
