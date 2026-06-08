/** OT Level 3 · Session 9 · Game 4 — Delayed Mirror · Theme: "Wait Copy" */
import { MirrorPoseGame } from '@/components/game/occupational/level3/session9/MirrorPoseGame';
import React from 'react';

const DelayedMirrorGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorPoseGame
    {...props}
    mode="delayedMirror"
    theme={{
      title: 'Wait Copy', subtitle: 'Watch, wait, then copy from memory', emoji: '⏱️',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', confirmBg: '#D97706',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#D97706', statLabel: '#F59E0B', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B',
    }}
    ttsIntro="Watch the pose, wait two seconds, then copy it from memory!"
    ttsComplete="Great memory copying!"
    ttsDelayedWatch="Watch this pose!"
    ttsDelayedWait="Wait, then copy from memory!"
    ttsDelayedCopy="Now copy the pose!"
    confirmLabel="✓ I remembered it!"
    congratsMessage="Wait Copy Star!"
    logType="delayed-mirror"
    skillTags={['working-memory', 'delayed-imitation']}
  />
);

export default DelayedMirrorGame;
