/** OT Level 5 · Session 1 · Game 4 — Chase the Star · Theme: "Star Hunt" */
import { MovingTargetTapGame } from '@/components/game/occupational/level5/session1/MovingTargetTapGame';
import React from 'react';

const ChaseTheStarGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MovingTargetTapGame
    {...props}
    mode="erratic"
    theme={{
      title: 'Star Hunt', subtitle: 'Catch the star as it darts around', emoji: '⭐',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', objectEmoji: '⭐', objectBg: '#D97706',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#D97706', statLabel: '#F59E0B', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B',
    }}
    ttsIntro="Chase the star! It moves in unpredictable directions."
    ttsComplete="Amazing star hunting!"
    ttsCue="Catch the star!"
    ttsSuccess="Star caught!"
    congratsMessage="Star Hunt Champion!"
    logType="chase-the-star"
    skillTags={['predictive-tracking', 'visual-tracking', 'reaction-time']}
  />
);

export default ChaseTheStarGame;
