/** OT Level 3 · Session 10 · Game 3 — Shape Pose · Theme: "Shape Body" */
import { PostureGame } from '@/components/game/occupational/level3/session10/PostureGame';
import React from 'react';

const ShapePoseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureGame
    {...props}
    mode="shapePose"
    theme={{
      title: 'Shape Body', subtitle: 'Make a circle or line with your body', emoji: '⭕',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#22C55E'],
      accent: '#22C55E', accentDark: '#15803D', confirmBg: '#16A34A',
      backText: '#166534', backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D', subtitleColor: '#16A34A', statLabel: '#22C55E', statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)', playBorder: 'rgba(34,197,94,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#22C55E',
    }}
    ttsIntro="Make your body into a circle or a line!"
    ttsComplete="Shape body star!"
    ttsWatch="Watch the shape!"
    ttsConfirm="Make the shape with your body!"
    confirmLabel="✓ I made the shape!"
    congratsMessage="Shape Body Pro!"
    logType="shape-pose"
    skillTags={['body-control', 'spatial-awareness', 'posture']}
  />
);

export default ShapePoseGame;
