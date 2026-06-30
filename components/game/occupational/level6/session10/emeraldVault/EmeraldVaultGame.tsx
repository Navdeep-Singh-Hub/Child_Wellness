/** OT Level 6 · Session 10 · Game 1 — Emerald Vault */
import { IntegratedChallengeGame } from '@/components/game/occupational/level6/session10/IntegratedChallengeGame';
import React from 'react';

const EmeraldVaultGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <IntegratedChallengeGame {...props} mode="jungleAdventure" />
);

export default EmeraldVaultGame;
