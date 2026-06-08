/** OT Level 2 · Session 7 · Game 3 — Triangle Mountain Trace · Theme: "Peak Trace" */
import { LargeShapeTraceGame } from '@/components/game/occupational/level2/session7/LargeShapeTraceGame';
import React from 'react';

const TriangleMountainTraceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <LargeShapeTraceGame
    {...props}
    mode="triangle"
    theme={{
      title: 'Peak Trace', subtitle: 'Climb the triangle mountain with your whole arm', emoji: '⛰️',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      guideStroke: 'rgba(245,158,11,0.45)', progressStroke: '#D97706',
      fillColor: 'rgba(245,158,11,0.3)', fillDoneColor: '#F59E0B',
      objectColor: '#F59E0B', objectOffColor: '#EF4444',
      backText: '#B45309', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#92400E', subtitleColor: '#B45309', statLabel: '#D97706', statValue: '#92400E',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.4)',
      sparkleColor: '#F59E0B', hintText: 'Trace up and down each side of the mountain!',
      objectEmoji: '🔺',
    }}
    ttsIntro="Trace the triangle mountain with your whole arm!"
    ttsComplete="Mountain traced!"
    ttsIncomplete="Trace the whole triangle!"
    congratsMessage="Peak Climber!"
    logType="triangleMountainTrace"
    skillTags={['whole-arm-movement', 'pre-writing', 'large-shape-tracing']}
  />
);

export default TriangleMountainTraceGame;
