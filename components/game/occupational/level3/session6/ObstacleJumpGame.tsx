/** OT Level 3 · Session 6 · Game 5 — Obstacle Jump · Theme: "Rock Hop" */
import { JumpTapGame } from '@/components/game/occupational/level3/session6/JumpTapGame';
import React from 'react';

const ObstacleJumpGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <JumpTapGame
    {...props}
    mode="obstacleJump"
    theme={{
      title: 'Rock Hop', subtitle: 'Double tap to jump over the rock', emoji: '🪨',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', objectEmoji: '🐰', obstacleEmoji: '🪨',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#D97706', statLabel: '#F59E0B', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B', hintText: 'Hop the rock!',
    }}
    ttsIntro="A rock is coming! Double tap to jump over it!"
    ttsComplete="Great obstacle jumping!"
    ttsDoubleTap="Double tap to jump!"
    ttsObstacleMiss="Jump over the rock with a double tap!"
    congratsMessage="Rock Hop Star!"
    logType="obstacle-jump"
    skillTags={['timing', 'motor-planning', 'reaction']}
  />
);

export default ObstacleJumpGame;
