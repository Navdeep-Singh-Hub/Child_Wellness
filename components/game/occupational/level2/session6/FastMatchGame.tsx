/** OT Level 2 · Session 6 · Game 5 — Fast Match · Theme: "Quick Match" */
import { DragShapeMatchGame } from '@/components/game/occupational/level2/session6/DragShapeMatchGame';
import React from 'react';

const FastMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DragShapeMatchGame
    {...props}
    shapePool={['circle', 'square', 'triangle', 'pentagon']}
    outlineMode="stroke"
    fastPacing
    theme={{
      title: 'Quick Match', subtitle: 'Match shapes quickly — no rotation', emoji: '⚡',
      gradient: ['#FEF2F2', '#FECACA', '#F87171', '#EF4444'],
      shapeFill: '#EF4444', shapeStroke: '#DC2626',
      outlineFill: 'none', outlineStroke: '#B91C1C',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#991B1B', subtitleColor: '#B91C1C', statLabel: '#DC2626', statValue: '#991B1B',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444',
      rotateBtnBg: 'rgba(255,255,255,0.7)', rotateBtnBorder: 'rgba(239,68,68,0.3)', rotateBtnText: '#991B1B',
      hintText: 'Drag fast — match before the next round!',
    }}
    ttsIntro="Match shapes quickly! No rotation needed."
    ttsComplete="Fast match complete!"
    ttsWrong="Match faster!"
    congratsMessage="Speed Matcher!"
    logType="fastMatch"
    skillTags={['visual-discrimination', 'motor-accuracy', 'speed-matching']}
  />
);

export default FastMatchGame;
