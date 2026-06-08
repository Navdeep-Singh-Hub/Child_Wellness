/** OT Level 2 · Session 8 · Game 3 — Dot Border Shapes · Theme: "Dotted Edge" */
import { SmallShapeTraceGame } from '@/components/game/occupational/level2/session8/SmallShapeTraceGame';
import { SESSION8_PACING } from '@/components/game/occupational/level2/session8/session8Pacing';
import React from 'react';

const DotBorderShapesGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SmallShapeTraceGame
    {...props}
    mode="dots"
    dotBorder
    dotPool={['triangle', 'pentagon', 'hexagon']}
    dotShapeSize={SESSION8_PACING.dotShapeSize}
    theme={{
      title: 'Dotted Edge', subtitle: 'Trace along the dotted border shape', emoji: '⚫',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      guideStroke: 'rgba(139,92,246,0.55)', progressStroke: '#7C3AED',
      objectColor: '#8B5CF6', objectOffColor: '#EF4444',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#5B21B6', subtitleColor: '#6D28D9', statLabel: '#7C3AED', statValue: '#5B21B6',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6', hintText: 'Follow the dotted outline all the way around!',
      objectEmoji: '⚫',
    }}
    ttsIntro="Trace the dotted border shape with precision!"
    ttsComplete="Dotted shapes done!"
    ttsIncomplete="Trace the whole dotted shape!"
    congratsMessage="Dot Detective!"
    logType="dotBorderShapes"
    skillTags={['finger-control', 'precision', 'small-shape-tracing']}
  />
);

export default DotBorderShapesGame;
