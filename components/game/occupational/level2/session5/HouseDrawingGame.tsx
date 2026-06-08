/** OT Level 2 · Session 5 · Game 4 — House Drawing · Theme: "Home Builder" */
import { ConnectDotsGame } from '@/components/game/occupational/level2/session5/ConnectDotsGame';
import { makeHouseShape } from '@/components/game/occupational/level2/session5/dotUtils';
import React from 'react';

const HouseDrawingGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ConnectDotsGame
    {...props}
    theme={{
      title: 'Home Builder', subtitle: 'Connect the dots to draw a house', emoji: '🏠',
      gradient: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD'],
      lineStroke: '#7C3AED', dotFill: '#E5E7EB', dotConnected: '#8B5CF6', dotStroke: '#9CA3AF',
      glowColor: '#8B5CF6', revealFill: '#8B5CF6',
      backText: '#6D28D9', backBorder: 'rgba(109,40,217,0.25)',
      titleColor: '#6D28D9', subtitleColor: '#7C3AED', statLabel: '#7C3AED', statValue: '#6D28D9',
      statBorder: 'rgba(109,40,217,0.2)', playBorder: 'rgba(109,40,217,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#7C3AED',
    }}
    generateRound={makeHouseShape}
    ttsIntro="Connect the dots in order to draw a house!"
    ttsComplete="Home builder complete!"
    ttsWrong="Tap the dots in order!"
    congratsMessage="Home Designer!"
    logType="houseDrawing"
    skillTags={['planning', 'number-sequence', 'house-drawing']}
  />
);

export default HouseDrawingGame;
