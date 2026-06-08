/** OT Level 3 · Session 9 · Game 2 — Hand Mirror · Theme: "Flip Hand" */
import { MirrorPoseGame } from '@/components/game/occupational/level3/session9/MirrorPoseGame';
import React from 'react';

const HandMirrorGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorPoseGame
    {...props}
    mode="handMirror"
    theme={{
      title: 'Flip Hand', subtitle: 'Screen shows one hand — you raise the opposite', emoji: '👋',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', confirmBg: '#7C3AED',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#7C3AED', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6',
    }}
    ttsIntro="When the screen shows a left hand, you raise your right hand — mirror it!"
    ttsComplete="Perfect mirroring!"
    ttsHandMirror="Raise your opposite hand!"
    confirmLabel="✓ I mirrored it!"
    congratsMessage="Flip Hand Pro!"
    logType="hand-mirror"
    skillTags={['brain-coordination', 'mirror-movements']}
  />
);

export default HandMirrorGame;
