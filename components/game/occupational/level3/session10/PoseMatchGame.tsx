/** OT Level 3 · Session 10 · Game 1 — Pose Match · Theme: "Posture Match" */
import { PostureGame } from '@/components/game/occupational/level3/session10/PostureGame';
import React from 'react';

const PoseMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureGame
    {...props}
    mode="poseMatch"
    theme={{
      title: 'Posture Match', subtitle: 'Match the yoga pose on screen', emoji: '🎯',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', confirmBg: '#2563EB',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6',
    }}
    ttsIntro="Watch each yoga pose, copy it with your body, then tap done!"
    ttsComplete="Great posture matching!"
    ttsWatch="Watch this pose!"
    ttsConfirm="Match the same posture!"
    ttsMiss="Try to match the pose!"
    confirmLabel="✓ I matched it!"
    congratsMessage="Posture Match Star!"
    logType="pose-match"
    skillTags={['precision', 'focus', 'posture-matching']}
  />
);

export default PoseMatchGame;
