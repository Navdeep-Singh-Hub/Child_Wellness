/** OT Level 2 · Session 8 · Game 5 — Shrink Mode Trace · Theme: "Shrink Sprint" */
import { SmallShapeTraceGame } from '@/components/game/occupational/level2/session8/SmallShapeTraceGame';
import React from 'react';

const ShrinkModeTraceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SmallShapeTraceGame
    {...props}
    mode="circle"
    shrinkMode
    theme={{
      title: 'Shrink Sprint', subtitle: 'Trace the circle as it shrinks each round', emoji: '🔽',
      gradient: ['#FEF2F2', '#FECACA', '#F87171', '#EF4444'],
      guideStroke: 'rgba(239,68,68,0.5)', progressStroke: '#DC2626',
      objectColor: '#EF4444', objectOffColor: '#991B1B',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#991B1B', subtitleColor: '#B91C1C', statLabel: '#DC2626', statValue: '#991B1B',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.3)', playBg: 'rgba(254,202,202,0.5)',
      sparkleColor: '#EF4444', hintText: 'The circle shrinks each round — trace carefully!',
      objectEmoji: '🔽',
    }}
    ttsIntro="Trace the circle as it shrinks smaller each round!"
    ttsComplete="Shrink trace complete!"
    ttsIncomplete="Trace the whole shrinking circle!"
    congratsMessage="Shrink Champion!"
    logType="shrinkModeTrace"
    skillTags={['finger-control', 'precision', 'shrinking-shape-tracing']}
  />
);

export default ShrinkModeTraceGame;
