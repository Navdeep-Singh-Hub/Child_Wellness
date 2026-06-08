/** OT Level 2 · Session 5 · Game 3 — Star Builder · Theme: "Star Forge" */
import { ConnectDotsGame } from '@/components/game/occupational/level2/session5/ConnectDotsGame';
import { makeStarShape } from '@/components/game/occupational/level2/session5/dotUtils';
import React from 'react';

const StarBuilderGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ConnectDotsGame
    {...props}
    theme={{
      title: 'Star Forge', subtitle: 'Connect all dots to build a star', emoji: '⭐',
      gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'],
      lineStroke: '#D97706', dotFill: '#E5E7EB', dotConnected: '#FBBF24', dotStroke: '#9CA3AF',
      glowColor: '#FBBF24', revealFill: '#FBBF24',
      backText: '#92400E', backBorder: 'rgba(146,64,14,0.25)',
      titleColor: '#92400E', subtitleColor: '#B45309', statLabel: '#B45309', statValue: '#92400E',
      statBorder: 'rgba(146,64,14,0.2)', playBorder: 'rgba(146,64,14,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#FBBF24',
    }}
    generateRound={makeStarShape}
    ttsIntro="Connect the dots in order to build a star!"
    ttsComplete="Star forge complete!"
    ttsWrong="Tap the dots in order!"
    congratsMessage="Star Builder!"
    logType="starBuilder"
    skillTags={['planning', 'number-sequence', 'star-drawing']}
  />
);

export default StarBuilderGame;
