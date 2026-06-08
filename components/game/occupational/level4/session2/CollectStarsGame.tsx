/** OT Level 4 · Session 2 · Game 2 — Collect Stars · Theme: "Star Sweep" */
import { ReverseHorizontalDragGame } from '@/components/game/occupational/level4/session2/ReverseHorizontalDragGame';
import React from 'react';

const CollectStarsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReverseHorizontalDragGame
    {...props}
    mode="collectStars"
    theme={{
      title: 'Star Sweep', subtitle: 'Drag stars into the bag on the left', emoji: '⭐',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', draggableEmoji: '⭐', targetEmoji: '🎒',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#D97706', statLabel: '#F59E0B', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B', zoneBorder: 'rgba(245,158,11,0.45)',
    }}
    ttsIntro="Drag stars from the right into the bag on the left!"
    ttsComplete="All stars collected!"
    ttsDrag="Sweep the star to the bag!"
    ttsMiss="Drag the star to the left bag!"
    congratsMessage="Star Sweep Hero!"
    logType="collect-stars"
    skillTags={['cross-body-reach', 'drag-right-left']}
  />
);

export default CollectStarsGame;
