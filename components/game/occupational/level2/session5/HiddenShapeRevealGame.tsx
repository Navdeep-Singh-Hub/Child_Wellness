/** OT Level 2 · Session 5 · Game 5 — Hidden Shape Reveal · Theme: "Mystery Shape" */
import { ConnectDotsGame } from '@/components/game/occupational/level2/session5/ConnectDotsGame';
import { makeHiddenShape } from '@/components/game/occupational/level2/session5/dotUtils';
import React from 'react';

const HiddenShapeRevealGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ConnectDotsGame
    {...props}
    theme={{
      title: 'Mystery Shape', subtitle: 'Connect the dots to reveal the hidden shape', emoji: '✨',
      gradient: ['#FDF2F8', '#FCE7F3', '#FBCFE8', '#F9A8D4'],
      lineStroke: '#DB2777', dotFill: '#E5E7EB', dotConnected: '#EC4899', dotStroke: '#9CA3AF',
      glowColor: '#EC4899', revealFill: '#F472B6',
      backText: '#BE185D', backBorder: 'rgba(236,72,153,0.25)',
      titleColor: '#BE185D', subtitleColor: '#DB2777', statLabel: '#DB2777', statValue: '#BE185D',
      statBorder: 'rgba(236,72,153,0.2)', playBorder: 'rgba(236,72,153,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EC4899',
    }}
    generateRound={makeHiddenShape}
    ttsIntro="Connect the dots in order to reveal the hidden shape!"
    ttsComplete="Mystery shape complete!"
    ttsWrong="Tap the dots in order!"
    congratsMessage="Shape Revealer!"
    logType="hiddenShapeReveal"
    skillTags={['planning', 'number-sequence', 'shape-reveal']}
  />
);

export default HiddenShapeRevealGame;
