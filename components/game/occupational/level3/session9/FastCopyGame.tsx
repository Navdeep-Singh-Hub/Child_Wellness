/** OT Level 3 · Session 9 · Game 5 — Speed Pose */
import { MirrorPoseGame } from '@/components/game/occupational/level3/session9/MirrorPoseGame';
import { GAME_THEMES, HERO_SHELL } from '@/components/game/occupational/level3/session9/superheroTheme';
import React from 'react';

const G = GAME_THEMES.fastCopy;

const FastCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorPoseGame
    {...props}
    mode="fastCopy"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444',
      accentDark: '#B91C1C',
      confirmBg: '#DC2626',
      backText: '#991B1B',
      backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D',
      subtitleColor: '#DC2626',
      statLabel: '#EF4444',
      statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)',
      playBorder: 'rgba(239,68,68,0.25)',
      playBg: HERO_SHELL.playBg,
      sparkleColor: HERO_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsFastPose="Copy fast!"
    confirmLabel="✅ Done!"
    congratsMessage={G.congrats}
    logType="fast-copy"
    skillTags={['reaction-speed', 'pose-recognition', 'motor-execution', 'visual-attention']}
  />
);

export default FastCopyGame;
