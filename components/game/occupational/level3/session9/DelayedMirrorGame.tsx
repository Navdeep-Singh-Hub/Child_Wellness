/** OT Level 3 · Session 9 · Game 4 — Wait Copy */
import { MirrorPoseGame } from '@/components/game/occupational/level3/session9/MirrorPoseGame';
import { GAME_THEMES, HERO_SHELL } from '@/components/game/occupational/level3/session9/superheroTheme';
import React from 'react';

const G = GAME_THEMES.delayedMirror;

const DelayedMirrorGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorPoseGame
    {...props}
    mode="delayedMirror"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FFFBEB', '#FEF3C7', '#FDE047', '#CA8A04'],
      accent: '#EAB308',
      accentDark: '#A16207',
      confirmBg: '#A16207',
      backText: '#854D0E',
      backBorder: 'rgba(234,179,8,0.25)',
      titleColor: '#713F12',
      subtitleColor: '#A16207',
      statLabel: '#CA8A04',
      statValue: '#713F12',
      statBorder: 'rgba(202,138,4,0.2)',
      playBorder: 'rgba(202,138,4,0.25)',
      playBg: HERO_SHELL.playBg,
      sparkleColor: HERO_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsDelayedWatch="Watch this pose!"
    ttsDelayedWait="Wait, then copy from memory!"
    ttsDelayedCopy="Now copy the pose from memory!"
    confirmLabel="✅ Done!"
    congratsMessage={G.congrats}
    logType="delayed-mirror"
    skillTags={['delayed-recall', 'memory-retention', 'attention-control', 'motor-imitation']}
  />
);

export default DelayedMirrorGame;
