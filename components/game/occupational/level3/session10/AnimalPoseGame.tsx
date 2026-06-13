/** OT Level 3 · Session 10 · Game 2 — Wild Pose · Zen Animal Academy */
import { PostureGame } from '@/components/game/occupational/level3/session10/PostureGame';
import { GAME_THEMES, ZEN_SHELL } from '@/components/game/occupational/level3/session10/zenAcademyTheme';
import React from 'react';

const G = GAME_THEMES.animalPose;

const AnimalPoseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureGame
    {...props}
    mode="animalPose"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FFFBEB', '#FEF3C7', '#BBF7D0', '#22C55E'],
      accent: '#F59E0B',
      accentDark: '#B45309',
      confirmBg: '#D97706',
      backText: ZEN_SHELL.backText,
      backBorder: ZEN_SHELL.backBorder,
      titleColor: '#78350F',
      subtitleColor: '#D97706',
      statLabel: ZEN_SHELL.statLabel,
      statValue: ZEN_SHELL.statValue,
      statBorder: ZEN_SHELL.statBorder,
      playBorder: ZEN_SHELL.playBorder,
      playBg: ZEN_SHELL.playBg,
      sparkleColor: '#F59E0B',
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsWatch="Watch Buddy Dog's animal pose!"
    ttsConfirm="Copy the wild pose!"
    confirmLabel="✅ Done"
    congratsMessage={G.congrats}
    logType="animal-pose"
    skillTags={['flexibility', 'motor-planning', 'body-control', 'animal-poses']}
  />
);

export default AnimalPoseGame;
