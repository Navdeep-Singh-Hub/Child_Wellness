/** OT Level 4 · Session 3 · Game 1 — Top-Left to Bottom-Right · Theme: "Diagonal Dash" */
import { DiagonalDragGame } from '@/components/game/occupational/level4/session3/DiagonalDragGame';
import React from 'react';

const TopLeftToBottomRightGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DiagonalDragGame
    {...props}
    mode="cornerDrag"
    theme={{
      title: 'Diagonal Dash', subtitle: 'Drag from top-left to bottom-right', emoji: '↘️',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', draggableEmoji: '📦', targetEmoji: '🎯',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6', zoneBorder: 'rgba(59,130,246,0.45)',
    }}
    ttsIntro="Drag diagonally from the top-left to the bottom-right!"
    ttsComplete="Great diagonal dashing!"
    ttsDrag="Drag to the bottom-right corner!"
    ttsMiss="Try the bottom-right corner!"
    congratsMessage="Diagonal Dash Star!"
    logType="top-left-bottom-right"
    skillTags={['midline-crossing', 'reading-prep', 'diagonal-drag']}
  />
);

export default TopLeftToBottomRightGame;
