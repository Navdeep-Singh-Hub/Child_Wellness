/** OT Level 3 · Session 9 · Game 1 — Copy Pose · Theme: "Pose Match" */
import { MirrorPoseGame } from '@/components/game/occupational/level3/session9/MirrorPoseGame';
import React from 'react';

const CopyPoseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorPoseGame
    {...props}
    mode="copyPose"
    theme={{
      title: 'Pose Match', subtitle: 'Watch the pose, copy it, then tap done', emoji: '👤',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', confirmBg: '#2563EB',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6',
    }}
    ttsIntro="Watch each pose on screen, copy it with your body, then tap the button!"
    ttsComplete="Great pose matching!"
    ttsCopyPose="Copy this pose!"
    confirmLabel="✓ I copied the pose!"
    congratsMessage="Pose Match Star!"
    logType="copy-pose"
    skillTags={['observation', 'motor-imitation']}
  />
);

export default CopyPoseGame;
