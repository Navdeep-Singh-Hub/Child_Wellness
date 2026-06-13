/** OT Level 3 · Session 9 · Game 1 — Pose Match */
import { MirrorPoseGame } from '@/components/game/occupational/level3/session9/MirrorPoseGame';
import { GAME_THEMES, HERO_SHELL } from '@/components/game/occupational/level3/session9/superheroTheme';
import React from 'react';

const G = GAME_THEMES.copyPose;

const CopyPoseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorPoseGame
    {...props}
    mode="copyPose"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#2563EB'],
      accent: HERO_SHELL.accent,
      accentDark: HERO_SHELL.accentDark,
      confirmBg: HERO_SHELL.confirmBg,
      backText: HERO_SHELL.backText,
      backBorder: HERO_SHELL.backBorder,
      titleColor: HERO_SHELL.titleColor,
      subtitleColor: HERO_SHELL.subtitleColor,
      statLabel: HERO_SHELL.statLabel,
      statValue: HERO_SHELL.statValue,
      statBorder: HERO_SHELL.statBorder,
      playBorder: HERO_SHELL.playBorder,
      playBg: HERO_SHELL.playBg,
      sparkleColor: HERO_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsCopyPose="Now copy the superhero pose!"
    confirmLabel="✅ Done!"
    congratsMessage={G.congrats}
    logType="copy-pose"
    skillTags={['motor-imitation', 'body-awareness', 'observation', 'postural-control']}
  />
);

export default CopyPoseGame;
