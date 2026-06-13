/** OT Level 3 · Session 6 · Game 1 — Leap Frog */
import { JumpTapGame } from '@/components/game/occupational/level3/session6/JumpTapGame';
import { GAME_THEMES, POND_CHARACTERS, POND_GRADIENT, POND_SHELL } from '@/components/game/occupational/level3/session6/jumpPondTheme';
import React from 'react';

const G = GAME_THEMES.frogJump;

const FrogJumpGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <JumpTapGame
    {...props}
    mode="frogJump"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: POND_GRADIENT,
      accent: POND_SHELL.accent,
      accentDark: POND_SHELL.accentDark,
      objectEmoji: POND_CHARACTERS.freddy.emoji,
      backText: POND_SHELL.backText,
      backBorder: POND_SHELL.backBorder,
      titleColor: POND_SHELL.titleColor,
      subtitleColor: POND_SHELL.subtitleColor,
      statLabel: POND_SHELL.statLabel,
      statValue: POND_SHELL.statValue,
      statBorder: POND_SHELL.statBorder,
      playBorder: POND_SHELL.playBorder,
      playBg: POND_SHELL.playBg,
      sparkleColor: POND_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsDoubleTap="Tap twice to jump!"
    congratsMessage={G.congrats}
    logType="frog-jump"
    skillTags={['sequencing', 'motor-imitation', 'bilateral-tapping', 'motor-planning']}
  />
);

export default FrogJumpGame;
