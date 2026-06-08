/** OT Level 3 · Session 2 · Game 3 — Stretch vs Pinch · Theme: "Pinch & Stretch" */
import { ScaleMoveGame } from '@/components/game/occupational/level3/session2/ScaleMoveGame';
import React from 'react';

const StretchPinchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ScaleMoveGame
    {...props}
    mode="pinch"
    theme={{
      title: 'Pinch & Stretch', subtitle: 'Stretch to make it BIG, pinch to make it SMALL', emoji: '🤏',
      gradient: ['#FDF4FF', '#FAE8FF', '#E879F9', '#D946EF'],
      accent: '#D946EF', accentDark: '#A21CAF', bigColor: '#C026D3', smallColor: '#F472B6',
      backText: '#86198F', backBorder: 'rgba(217,70,239,0.25)',
      titleColor: '#701A75', subtitleColor: '#A21CAF', statLabel: '#D946EF', statValue: '#701A75',
      statBorder: 'rgba(217,70,239,0.2)', playBorder: 'rgba(217,70,239,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#D946EF', hintText: 'Use two fingers to stretch or pinch!',
      objectEmoji: '🎈',
    }}
    ttsIntro="Stretch with two fingers to make it big, pinch to make it small!"
    ttsComplete="Great pinch and stretch!"
    ttsBig="Make it BIG!"
    ttsSmall="Make it SMALL!"
    congratsMessage="Pinch Pro!"
    logType="stretchPinch"
    skillTags={['fine-motor', 'bilateral-coordination', 'force-grading']}
  />
);

export default StretchPinchGame;
