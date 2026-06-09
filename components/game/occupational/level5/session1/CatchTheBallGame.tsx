/** OT Level 5 · Session 1 · Game 1 — Catch the Ball · Theme: "Ball Chase" */
import { MovingTargetTapGame } from '@/components/game/occupational/level5/session1/MovingTargetTapGame';
import React from 'react';

const CatchTheBallGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MovingTargetTapGame
    {...props}
    mode="bounce"
    theme={{
      title: 'Ball Chase', subtitle: 'Tap the bouncing ball as it moves', emoji: '⚽',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', objectEmoji: '⚽', objectBg: '#2563EB',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6',
    }}
    ttsIntro="Catch the bouncing ball! Tap it when you see it move."
    ttsComplete="Great ball chasing!"
    ttsCue="Tap the ball!"
    ttsSuccess="Nice catch!"
    congratsMessage="Ball Chase Star!"
    logType="catch-the-ball"
    skillTags={['visual-tracking', 'reaction-time', 'moving-object']}
  />
);

export default CatchTheBallGame;
