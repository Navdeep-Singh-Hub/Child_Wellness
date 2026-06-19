import VisualGauntletGame from '@/components/game/occupational/level5/session10/VisualGauntletGame';
import { REACTION_RELAY_CONFIG } from '@/components/game/occupational/level5/session10/visualGauntletConfig';
import React from 'react';

const ReactionRelayGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VisualGauntletGame {...props} config={REACTION_RELAY_CONFIG} />
);
export default ReactionRelayGame;
