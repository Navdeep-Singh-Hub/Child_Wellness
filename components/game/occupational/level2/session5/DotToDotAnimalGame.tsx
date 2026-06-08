/** OT Level 2 · Session 5 · Game 2 — Dot to Dot Animal · Theme: "Animal Sketch" */
import { ConnectDotsGame } from '@/components/game/occupational/level2/session5/ConnectDotsGame';
import { makeAnimalShape } from '@/components/game/occupational/level2/session5/dotUtils';
import React from 'react';

const DotToDotAnimalGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ConnectDotsGame
    {...props}
    theme={{
      title: 'Animal Sketch', subtitle: 'Connect the dots to reveal the animal', emoji: '🐾',
      gradient: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD'],
      lineStroke: '#2563EB', dotFill: '#E5E7EB', dotConnected: '#3B82F6', dotStroke: '#9CA3AF',
      glowColor: '#3B82F6', revealFill: '#3B82F6',
      backText: '#1D4ED8', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1D4ED8', subtitleColor: '#2563EB', statLabel: '#2563EB', statValue: '#1D4ED8',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#2563EB',
    }}
    generateRound={makeAnimalShape}
    ttsIntro="Connect the dots in order to reveal the animal!"
    ttsComplete="Animal sketch complete!"
    ttsWrong="Tap the dots in order!"
    congratsMessage="Animal Artist!"
    logType="dotToDotAnimal"
    skillTags={['planning', 'number-sequence', 'shape-recognition']}
  />
);

export default DotToDotAnimalGame;
