/** OT Level 6 · Session 4 · Game 5 — Wave Sentinel */
import { BalanceGame } from '@/components/game/occupational/level6/session4/BalanceGame';
import React from 'react';

const WaveSentinelGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BalanceGame {...props} mode="freezeHero" />
);

export default WaveSentinelGame;
