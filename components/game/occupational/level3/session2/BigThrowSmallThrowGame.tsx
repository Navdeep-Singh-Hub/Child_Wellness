/** OT Level 3 · Session 2 · Game 4 — Big Throw vs Small Throw · Theme: "Throw Range" */
import { ScaleMoveGame } from '@/components/game/occupational/level3/session2/ScaleMoveGame';
import React from 'react';

const BigThrowSmallThrowGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ScaleMoveGame
    {...props}
    mode="throw"
    theme={{
      title: 'Throw Range', subtitle: 'Drag far for a BIG throw, short for a SMALL throw', emoji: '⚾',
      gradient: ['#FFF7ED', '#FFEDD5', '#FDBA74', '#F97316'],
      accent: '#F97316', accentDark: '#C2410C', bigColor: '#EA580C', smallColor: '#FBBF24',
      backText: '#9A3412', backBorder: 'rgba(249,115,22,0.25)',
      titleColor: '#7C2D12', subtitleColor: '#C2410C', statLabel: '#EA580C', statValue: '#7C2D12',
      statBorder: 'rgba(249,115,22,0.2)', playBorder: 'rgba(249,115,22,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F97316', hintText: 'Drag the ball and release to throw!',
      objectEmoji: '⚾',
    }}
    ttsIntro="Drag far to throw it far, drag a little to throw it near!"
    ttsComplete="Great throwing control!"
    ttsBig="Throw it FAR!"
    ttsSmall="Throw it NEAR!"
    congratsMessage="Throw Champion!"
    logType="bigThrowSmallThrow"
    skillTags={['gross-motor', 'force-grading', 'movement-scaling']}
  />
);

export default BigThrowSmallThrowGame;
