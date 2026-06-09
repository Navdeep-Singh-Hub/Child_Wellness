/** OT Level 4 · Session 6 · Game 3 — Target Pass · Theme: "Aim Pass" */
import { MidlineDragPassGame } from '@/components/game/occupational/level4/session6/MidlineDragPassGame';
import React from 'react';

const TargetPassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MidlineDragPassGame
    {...props}
    mode="targetPass"
    theme={{
      title: 'Aim Pass', subtitle: 'Drag the ball across midline to the target', emoji: '🎯',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C', ballEmoji: '⚽', targetEmoji: '🎯', obstacleEmoji: '🚧',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#B91C1C', statLabel: '#DC2626', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444', midlineColor: 'rgba(239,68,68,0.35)',
    }}
    ttsIntro="Drag the ball across your body to the target!"
    ttsComplete="Great aiming across midline!"
    ttsDrag="Drag the ball to the target across your body!"
    ttsMiss="Drag to the target across your body!"
    ttsSuccess="Perfect pass!"
    congratsMessage="Aim Pass Star!"
    logType="target-pass"
    skillTags={['accuracy', 'midline-crossing', 'target-aiming']}
  />
);

export default TargetPassGame;
