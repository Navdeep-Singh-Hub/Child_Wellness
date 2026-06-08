/** OT Level 4 · Session 2 · Game 1 — Reverse Ball Pass · Theme: "Return Pass" */
import { ReverseHorizontalDragGame } from '@/components/game/occupational/level4/session2/ReverseHorizontalDragGame';
import React from 'react';

const ReverseBallPassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReverseHorizontalDragGame
    {...props}
    mode="ballTransfer"
    theme={{
      title: 'Return Pass', subtitle: 'Drag the ball from right to left', emoji: '⚽',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', draggableEmoji: '⚽', targetEmoji: '🥅',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6', zoneBorder: 'rgba(59,130,246,0.45)',
    }}
    ttsIntro="Drag the ball from the right zone to the left zone!"
    ttsComplete="Great return passing!"
    ttsDrag="Drag the ball to the left!"
    ttsMiss="Try dragging to the left goal!"
    congratsMessage="Return Pass Star!"
    logType="reverse-ball-pass"
    skillTags={['bilateral-balance', 'drag-right-left']}
  />
);

export default ReverseBallPassGame;
