/** OT Level 4 · Session 6 · Game 5 — Obstacle Pass · Theme: "Detour Pass" */
import { MidlineDragPassGame } from '@/components/game/occupational/level4/session6/MidlineDragPassGame';
import React from 'react';

const ObstaclePassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MidlineDragPassGame
    {...props}
    mode="obstaclePass"
    theme={{
      title: 'Detour Pass', subtitle: 'Go around the obstacle to the target', emoji: '🚧',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      accent: '#10B981', accentDark: '#047857', ballEmoji: '⚽', targetEmoji: '🎯', obstacleEmoji: '🚧',
      backText: '#065F46', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#064E3B', subtitleColor: '#047857', statLabel: '#059669', statValue: '#064E3B',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981', midlineColor: 'rgba(16,185,129,0.35)',
    }}
    ttsIntro="Drag around the obstacle to reach the target!"
    ttsComplete="Great detour passing!"
    ttsDrag="Drag around the obstacle to the target!"
    ttsMiss="Drag around the obstacle to the target!"
    ttsObstacle="Hit obstacle! Go around it!"
    ttsSuccess="Perfect! You avoided the obstacle!"
    congratsMessage="Detour Pass Star!"
    logType="obstacle-pass"
    skillTags={['planning-skill', 'obstacle-avoidance', 'midline-crossing']}
  />
);

export default ObstaclePassGame;
