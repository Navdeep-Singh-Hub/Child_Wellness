/** OT Level 3 · Session 10 · Game 3 — Shape Body · Zen Animal Academy */
import { PostureGame } from '@/components/game/occupational/level3/session10/PostureGame';
import { GAME_THEMES, ZEN_SHELL } from '@/components/game/occupational/level3/session10/zenAcademyTheme';
import React from 'react';

const G = GAME_THEMES.shapePose;

const ShapePoseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureGame
    {...props}
    mode="shapePose"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FDF4FF', '#F5D0FE', '#C4B5FD', '#A855F7'],
      accent: '#A855F7',
      accentDark: '#7E22CE',
      confirmBg: '#9333EA',
      backText: ZEN_SHELL.backText,
      backBorder: ZEN_SHELL.backBorder,
      titleColor: '#581C87',
      subtitleColor: '#9333EA',
      statLabel: ZEN_SHELL.statLabel,
      statValue: ZEN_SHELL.statValue,
      statBorder: ZEN_SHELL.statBorder,
      playBorder: ZEN_SHELL.playBorder,
      playBg: ZEN_SHELL.playBg,
      sparkleColor: '#C084FC',
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsWatch="Watch the body shape!"
    ttsConfirm="Make the shape with your body!"
    confirmLabel="✅ Done"
    congratsMessage={G.congrats}
    logType="shape-pose"
    skillTags={['spatial-awareness', 'body-positioning', 'creativity', 'motor-planning']}
  />
);

export default ShapePoseGame;
