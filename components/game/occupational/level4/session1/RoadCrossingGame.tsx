/** OT Level 4 · Session 1 · Game 3 — Road Crossing · Theme: "Lane Cross" */
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/HorizontalDragGame';
import React from 'react';

const RoadCrossingGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame
    {...props}
    mode="roadCrossing"
    theme={{
      title: 'Lane Cross', subtitle: 'Drive the car across to the right lane', emoji: '🚗',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', draggableEmoji: '🚗', targetEmoji: '🛣️',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#7C3AED', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6', zoneBorder: 'rgba(139,92,246,0.45)',
    }}
    ttsIntro="Drag the car from the left lane to the right lane!"
    ttsComplete="Safe crossing!"
    ttsDrag="Cross to the right lane!"
    congratsMessage="Lane Cross Pro!"
    logType="road-crossing"
    skillTags={['spatial-planning', 'drag-left-right']}
  />
);

export default RoadCrossingGame;
