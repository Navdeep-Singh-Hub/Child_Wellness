/** OT Level 3 · Session 10 · Game 1 — Posture Match · Zen Animal Academy */
import { PostureGame } from '@/components/game/occupational/level3/session10/PostureGame';
import { GAME_THEMES, ZEN_SHELL } from '@/components/game/occupational/level3/session10/zenAcademyTheme';
import React from 'react';

const G = GAME_THEMES.poseMatch;

const PoseMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureGame
    {...props}
    mode="poseMatch"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ZEN_SHELL.gradient,
      accent: ZEN_SHELL.accent,
      accentDark: ZEN_SHELL.accentDark,
      confirmBg: ZEN_SHELL.confirmBg,
      backText: ZEN_SHELL.backText,
      backBorder: ZEN_SHELL.backBorder,
      titleColor: ZEN_SHELL.titleColor,
      subtitleColor: ZEN_SHELL.subtitleColor,
      statLabel: ZEN_SHELL.statLabel,
      statValue: ZEN_SHELL.statValue,
      statBorder: ZEN_SHELL.statBorder,
      playBorder: ZEN_SHELL.playBorder,
      playBg: ZEN_SHELL.playBg,
      sparkleColor: ZEN_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsWatch="Watch Master Owl's pose!"
    ttsConfirm="Copy the posture, then tap Done!"
    ttsMiss="Try to match the pose calmly!"
    confirmLabel="✅ Done"
    congratsMessage={G.congrats}
    logType="pose-match"
    skillTags={['postural-control', 'body-awareness', 'observation', 'focus']}
  />
);

export default PoseMatchGame;
