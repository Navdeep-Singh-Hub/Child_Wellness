/** OT Level 4 · Session 1 · Game 1 — Ball Transfer · Theme: "Goal Pass" */
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/HorizontalDragGame';
import React from 'react';

const BallTransferGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame
    {...props}
    mode="ballTransfer"
    theme={{
      title: 'Goal Pass', subtitle: 'Drag the ball from left to right', emoji: '⚽',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', draggableEmoji: '⚽', targetEmoji: '🥅',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6', zoneBorder: 'rgba(59,130,246,0.45)',
    }}
    ttsIntro="Drag the ball from the left zone to the right zone!"
    ttsComplete="Great ball passing!"
    ttsDrag="Drag the ball to the right!"
    congratsMessage="Goal Pass Star!"
    logType="ball-transfer"
    skillTags={['midline-crossing', 'brain-hemispheres', 'drag-left-right']}
  />
);

export default BallTransferGame;
