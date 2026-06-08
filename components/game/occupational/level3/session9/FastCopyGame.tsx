/** OT Level 3 · Session 9 · Game 5 — Fast Copy · Theme: "Speed Pose" */
import { MirrorPoseGame } from '@/components/game/occupational/level3/session9/MirrorPoseGame';
import React from 'react';

const FastCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorPoseGame
    {...props}
    mode="fastCopy"
    theme={{
      title: 'Speed Pose', subtitle: 'Three quick poses per round — copy fast!', emoji: '⚡',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C', confirmBg: '#DC2626',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#DC2626', statLabel: '#EF4444', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444',
    }}
    ttsIntro="Three fast poses each round — copy quickly and tap done!"
    ttsComplete="Speed pose champion!"
    ttsFastPose="Copy fast!"
    confirmLabel="✓ Done!"
    congratsMessage="Speed Pose Hero!"
    logType="fast-copy"
    skillTags={['speed', 'accuracy', 'quick-response']}
  />
);

export default FastCopyGame;
