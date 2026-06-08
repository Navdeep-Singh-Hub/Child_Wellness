/** OT Level 4 · Session 1 · Game 5 — Timed Drag · Theme: "Quick Drag" */
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/HorizontalDragGame';
import React from 'react';

const TimedDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame
    {...props}
    mode="timedDrag"
    theme={{
      title: 'Quick Drag', subtitle: 'Drag left to right before time runs out', emoji: '⏱️',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C', draggableEmoji: '⭐', targetEmoji: '🎯',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#DC2626', statLabel: '#EF4444', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444', zoneBorder: 'rgba(239,68,68,0.45)',
    }}
    ttsIntro="Drag from left to right before the timer runs out!"
    ttsComplete="Quick drag champion!"
    ttsTimed="Beat the clock!"
    ttsTimedMiss="Too slow — try faster!"
    congratsMessage="Quick Drag Hero!"
    logType="timed-drag"
    skillTags={['speed', 'accuracy', 'drag-left-right']}
  />
);

export default TimedDragGame;
