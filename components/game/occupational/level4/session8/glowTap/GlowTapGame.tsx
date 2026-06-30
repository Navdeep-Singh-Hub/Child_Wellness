/** OT Level 4 · Session 8 · Game 1 — Glow Tap */
import { GLOW_TAP_CONFIG } from '@/components/game/occupational/level4/session8/glowTap/glowTapTheme';
import { SideTapGame } from '@/components/game/occupational/level4/session8/shared/SideTapGame';
import React from 'react';

const GlowTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SideTapGame {...GLOW_TAP_CONFIG} {...props} />
);

export default GlowTapGame;
