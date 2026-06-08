/** OT Level 4 · Session 2 · Game 5 — Pattern Drag · Theme: "Pattern Run" */
import { ReversePathDragGame } from '@/components/game/occupational/level4/session2/ReversePathDragGame';
import React from 'react';

const PatternDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReversePathDragGame
    {...props}
    mode="patternDrag"
    theme={{
      title: 'Pattern Run', subtitle: 'Trace the pattern from right to left', emoji: '📐',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C', pathColor: '#10B981', draggableEmoji: '📦',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#DC2626', statLabel: '#EF4444', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444',
    }}
    ttsIntro="Follow the pattern while dragging from right to left!"
    ttsComplete="Perfect pattern running!"
    ttsDrag="Trace the pattern to the left!"
    ttsMiss="Follow the full pattern to the left!"
    congratsMessage="Pattern Run Star!"
    logType="pattern-drag"
    skillTags={['motor-planning', 'drag-right-left']}
  />
);

export default PatternDragGame;
