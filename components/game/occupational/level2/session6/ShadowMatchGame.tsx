/** OT Level 2 · Session 6 · Game 2 — Shadow Match · Theme: "Shadow Studio" */
import { DragShapeMatchGame } from '@/components/game/occupational/level2/session6/DragShapeMatchGame';
import React from 'react';

const ShadowMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DragShapeMatchGame
    {...props}
    shapePool={['circle', 'square', 'triangle', 'hexagon']}
    outlineMode="shadow"
    theme={{
      title: 'Shadow Studio', subtitle: 'Match the shape to its shadow', emoji: '🎭',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      shapeFill: '#3B82F6', shapeStroke: '#2563EB',
      outlineFill: '#374151', outlineStroke: '#1F2937',
      backText: '#1D4ED8', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E40AF', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E40AF',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6',
      rotateBtnBg: 'rgba(255,255,255,0.7)', rotateBtnBorder: 'rgba(59,130,246,0.3)', rotateBtnText: '#1E40AF',
      hintText: 'Line up the shape with its exact shadow!',
    }}
    ttsIntro="Match each shape to its shadow!"
    ttsComplete="Shadow master!"
    ttsWrong="Match the exact shadow!"
    congratsMessage="Shadow Star!"
    logType="shadowMatch"
    skillTags={['visual-discrimination', 'motor-accuracy', 'shadow-matching']}
  />
);

export default ShadowMatchGame;
