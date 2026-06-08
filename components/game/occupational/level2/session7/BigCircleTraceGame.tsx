/** OT Level 2 · Session 7 · Game 1 — Big Circle Trace · Theme: "Orbit Loop" */
import { LargeShapeTraceGame } from '@/components/game/occupational/level2/session7/LargeShapeTraceGame';
import React from 'react';

const BigCircleTraceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <LargeShapeTraceGame
    {...props}
    mode="circle"
    theme={{
      title: 'Orbit Loop', subtitle: 'Trace the big circle with your whole arm', emoji: '⭕',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      guideStroke: 'rgba(59,130,246,0.45)', progressStroke: '#2563EB',
      fillColor: 'rgba(59,130,246,0.3)', fillDoneColor: '#3B82F6',
      objectColor: '#3B82F6', objectOffColor: '#EF4444',
      backText: '#1D4ED8', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E40AF', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E40AF',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6', hintText: 'Use your whole arm — trace all the way around!',
      objectEmoji: '🔵',
    }}
    ttsIntro="Trace the big circle with your whole arm!"
    ttsComplete="Circle traced!"
    ttsIncomplete="Trace the whole circle!"
    congratsMessage="Orbit Master!"
    logType="bigCircleTrace"
    skillTags={['whole-arm-movement', 'pre-writing', 'large-shape-tracing']}
  />
);

export default BigCircleTraceGame;
