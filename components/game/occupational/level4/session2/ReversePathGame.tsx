/** OT Level 4 · Session 2 · Game 4 — Reverse Path · Theme: "Back Track" */
import { ReversePathDragGame } from '@/components/game/occupational/level4/session2/ReversePathDragGame';
import React from 'react';

const ReversePathGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReversePathDragGame
    {...props}
    mode="reversePath"
    theme={{
      title: 'Back Track', subtitle: 'Follow the reverse path right to left', emoji: '🔄',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', pathColor: '#8B5CF6', draggableEmoji: '📦',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#7C3AED', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6',
    }}
    ttsIntro="Follow the reverse path from right to left!"
    ttsComplete="Great reverse tracking!"
    ttsDrag="Follow the dashed path to the left!"
    ttsMiss="Follow the path to the left target!"
    congratsMessage="Back Track Master!"
    logType="reverse-path"
    skillTags={['cognitive-flexibility', 'drag-right-left']}
  />
);

export default ReversePathGame;
