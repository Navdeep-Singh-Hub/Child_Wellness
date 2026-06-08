/** OT Level 4 · Session 1 · Game 2 — Feed the Monster · Theme: "Monster Feed" */
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/HorizontalDragGame';
import React from 'react';

const FeedTheMonsterGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame
    {...props}
    mode="feedMonster"
    theme={{
      title: 'Monster Feed', subtitle: 'Drag food to the hungry monster', emoji: '👹',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', draggableEmoji: '🍎', targetEmoji: '👹',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#D97706', statLabel: '#F59E0B', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B', zoneBorder: 'rgba(245,158,11,0.45)',
    }}
    ttsIntro="Drag the food from left to feed the monster on the right!"
    ttsComplete="Monster is full!"
    ttsDrag="Feed the monster!"
    congratsMessage="Monster Feed Hero!"
    logType="feed-monster"
    skillTags={['direction-control', 'arm-coordination', 'drag-left-right']}
  />
);

export default FeedTheMonsterGame;
