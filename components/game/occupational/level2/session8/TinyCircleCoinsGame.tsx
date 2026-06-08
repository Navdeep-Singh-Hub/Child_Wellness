/** OT Level 2 · Session 8 · Game 1 — Tiny Circle Coins · Theme: "Coin Trace" */
import { SmallShapeTraceGame } from '@/components/game/occupational/level2/session8/SmallShapeTraceGame';
import { SESSION8_PACING } from '@/components/game/occupational/level2/session8/session8Pacing';
import React from 'react';

const TinyCircleCoinsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SmallShapeTraceGame
    {...props}
    mode="circle"
    circleRadius={SESSION8_PACING.tinyCircleRadius}
    theme={{
      title: 'Coin Trace', subtitle: 'Trace the tiny circle coin with precision', emoji: '🪙',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      guideStroke: 'rgba(245,158,11,0.5)', progressStroke: '#D97706',
      objectColor: '#F59E0B', objectOffColor: '#EF4444',
      backText: '#B45309', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#92400E', subtitleColor: '#B45309', statLabel: '#D97706', statValue: '#92400E',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.4)',
      sparkleColor: '#F59E0B', hintText: 'Use fingertip control — trace the full coin!',
      objectEmoji: '🪙',
    }}
    ttsIntro="Trace the tiny circle coin with precision!"
    ttsComplete="All coins traced!"
    ttsIncomplete="Trace the whole coin!"
    congratsMessage="Coin Collector!"
    logType="tinyCircleCoins"
    skillTags={['finger-control', 'precision', 'small-shape-tracing']}
  />
);

export default TinyCircleCoinsGame;
