import VisualGauntletGame from '@/components/game/occupational/level5/session10/VisualGauntletGame';
import { DEPTH_MIX_CONFIG } from '@/components/game/occupational/level5/session10/visualGauntletConfig';
import React from 'react';

const DepthMixGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VisualGauntletGame {...props} config={DEPTH_MIX_CONFIG} />
);
export default DepthMixGame;
