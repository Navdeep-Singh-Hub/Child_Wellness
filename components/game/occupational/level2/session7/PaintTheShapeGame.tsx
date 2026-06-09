/** OT Level 2 · Session 7 · Game 4 — Paint the Shape · Theme: "Color Fill" */
import { LargeShapeTraceGame } from '@/components/game/occupational/level2/session7/LargeShapeTraceGame';
import React from 'react';

const PaintTheShapeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <LargeShapeTraceGame
    {...props}
    mode="paint"
    paintPool={['star', 'heart', 'pentagon']}
    theme={{
      title: 'Color Fill', subtitle: 'Trace to fill the shape with color', emoji: '🎨',
      gradient: ['#FDF2F8', '#FCE7F3', '#F9A8D4', '#EC4899'],
      guideStroke: 'rgba(236,72,153,0.5)', progressStroke: '#DB2777',
      fillColor: 'rgba(236,72,153,0.35)', fillDoneColor: '#EC4899',
      objectColor: '#EC4899', objectOffColor: '#EF4444',
      backText: '#BE185D', backBorder: 'rgba(236,72,153,0.25)',
      titleColor: '#9D174D', subtitleColor: '#BE185D', statLabel: '#DB2777', statValue: '#9D174D',
      statBorder: 'rgba(236,72,153,0.2)', playBorder: 'rgba(236,72,153,0.3)', playBg: 'rgba(252,231,243,0.55)',
      sparkleColor: '#EC4899', hintText: 'Trace the outline to paint the shape!',
      objectEmoji: '🖌️',
    }}
    ttsIntro="Trace to fill the shape with color!"
    ttsComplete="Shape painted!"
    ttsIncomplete="Paint the whole shape!"
    congratsMessage="Paint Pro!"
    logType="paintTheShape"
    skillTags={['whole-arm-movement', 'pre-writing', 'large-shape-tracing']}
  />
);

export default PaintTheShapeGame;
