/** OT Level 2 · Session 5 · Game 1 — Connect in Order Glow · Theme: "Glow Connect" */
import { ConnectDotsGame } from '@/components/game/occupational/level2/session5/ConnectDotsGame';
import { makeRandomGlowShape } from '@/components/game/occupational/level2/session5/dotUtils';
import React from 'react';

const ConnectInOrderGlowGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ConnectDotsGame
    {...props}
    glowMode
    theme={{
      title: 'Glow Connect', subtitle: 'Tap the glowing dots in order', emoji: '💡',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#34D399'],
      lineStroke: '#059669', dotFill: '#E5E7EB', dotConnected: '#10B981', dotStroke: '#9CA3AF',
      glowColor: '#10B981', revealFill: '#10B981',
      backText: '#047857', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#047857', subtitleColor: '#059669', statLabel: '#059669', statValue: '#047857',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981',
    }}
    generateRound={makeRandomGlowShape}
    ttsIntro="Tap the glowing dots in order!"
    ttsComplete="Glow connect complete!"
    ttsWrong="Tap the glowing dot!"
    congratsMessage="Sequence Star!"
    logType="connectInOrderGlow"
    skillTags={['planning', 'number-sequence', 'glow-sequence']}
  />
);

export default ConnectInOrderGlowGame;
