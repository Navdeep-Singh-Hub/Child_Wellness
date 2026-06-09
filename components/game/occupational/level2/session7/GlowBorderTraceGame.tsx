/** OT Level 2 · Session 7 · Game 5 — Glow Border Trace · Theme: "Neon Ring" */
import { LargeShapeTraceGame } from '@/components/game/occupational/level2/session7/LargeShapeTraceGame';
import React from 'react';

const GlowBorderTraceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <LargeShapeTraceGame
    {...props}
    mode="circle"
    glowMode
    theme={{
      title: 'Neon Ring', subtitle: 'Follow the thick glowing border', emoji: '✨',
      gradient: ['#FAF5FF', '#F3E8FF', '#D8B4FE', '#A855F7'],
      guideStroke: 'rgba(168,85,247,0.6)', progressStroke: '#9333EA',
      fillColor: 'rgba(168,85,247,0.3)', fillDoneColor: '#A855F7',
      objectColor: '#A855F7', objectOffColor: '#EF4444',
      glowRing: 'rgba(168,85,247,0.45)',
      backText: '#7E22CE', backBorder: 'rgba(168,85,247,0.25)',
      titleColor: '#6B21A8', subtitleColor: '#7E22CE', statLabel: '#9333EA', statValue: '#6B21A8',
      statBorder: 'rgba(168,85,247,0.2)', playBorder: 'rgba(168,85,247,0.35)', playBg: 'rgba(30,27,75,0.45)',
      sparkleColor: '#A855F7', hintText: 'Follow the pulsing glow all the way around!',
      objectEmoji: '⭐',
    }}
    ttsIntro="Trace the thick glowing border!"
    ttsComplete="Glow traced!"
    ttsIncomplete="Follow the whole glow border!"
    congratsMessage="Neon Navigator!"
    logType="glowBorderTrace"
    skillTags={['whole-arm-movement', 'pre-writing', 'large-shape-tracing']}
  />
);

export default GlowBorderTraceGame;
