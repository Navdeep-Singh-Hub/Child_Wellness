/** OT Level 3 · Session 8 · Game 1 — Head Tap */
import { BodyMapGame } from '@/components/game/occupational/level3/session8/BodyMapGame';
import { GAME_THEMES, ROBO_SHELL } from '@/components/game/occupational/level3/session8/roboBodyTheme';
import React from 'react';

const G = GAME_THEMES.touchHead;

const TouchHeadGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyMapGame
    {...props}
    mode="touchHead"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#2563EB'],
      accent: '#3B82F6',
      accentDark: '#1D4ED8',
      backText: ROBO_SHELL.backText,
      backBorder: ROBO_SHELL.backBorder,
      titleColor: ROBO_SHELL.titleColor,
      subtitleColor: ROBO_SHELL.subtitleColor,
      statLabel: ROBO_SHELL.statLabel,
      statValue: ROBO_SHELL.statValue,
      statBorder: ROBO_SHELL.statBorder,
      playBorder: ROBO_SHELL.playBorder,
      playBg: ROBO_SHELL.playBg,
      sparkleColor: ROBO_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsHead="Touch the glowing body part!"
    congratsMessage={G.congrats}
    logType="touch-head"
    skillTags={['body-identification', 'visual-recognition', 'attention', 'body-schema']}
  />
);

export default TouchHeadGame;
