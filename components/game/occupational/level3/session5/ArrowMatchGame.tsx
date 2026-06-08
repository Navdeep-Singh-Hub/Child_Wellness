/** OT Level 3 · Session 5 · Game 2 — Arrow Match · Theme: "Arrow Sync" */
import { HorizontalSwipeGame } from '@/components/game/occupational/level3/session5/HorizontalSwipeGame';
import React from 'react';

const ArrowMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalSwipeGame
    {...props}
    mode="arrowMatch"
    theme={{
      title: 'Arrow Sync', subtitle: 'Swipe the same way the arrow points', emoji: '⬅️',
      gradient: ['#FFFBEB', '#FEF3C7', '#FDE047', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', objectEmoji: '⬅️',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#B45309', statLabel: '#F59E0B', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B', hintText: 'Match the arrow!',
    }}
    ttsIntro="Swipe in the same direction the arrow points!"
    ttsComplete="Perfect arrow matching!"
    ttsLeft="Arrow points left — swipe left!"
    ttsRight="Arrow points right — swipe right!"
    ttsWrongLeft="The arrow points left — swipe left!"
    ttsWrongRight="The arrow points right — swipe right!"
    congratsMessage="Arrow Ace!"
    logType="arrow-match"
    skillTags={['visual-motor-link', 'direction-matching', 'lateral-movement']}
  />
);

export default ArrowMatchGame;
