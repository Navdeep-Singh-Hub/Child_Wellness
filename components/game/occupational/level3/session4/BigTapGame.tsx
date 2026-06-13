/** OT Level 3 · Session 4 · Game 6 — Big Tap */
import { SizeGestureGame } from '@/components/game/occupational/level3/session4/SizeGestureGame';
import { GAME_THEMES, SKY_GRADIENT, SKY_SHELL } from '@/components/game/occupational/level3/session4/skyGroundTheme';
import React from 'react';

const G = GAME_THEMES.bigTap;

const BigTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SizeGestureGame
    {...props}
    mode="bigTap"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: SKY_GRADIENT,
      accent: SKY_SHELL.accent,
      accentDark: SKY_SHELL.accentDark,
      bigColor: '#2563EB',
      smallColor: '#94A3B8',
      backText: SKY_SHELL.backText,
      backBorder: SKY_SHELL.backBorder,
      titleColor: SKY_SHELL.titleColor,
      subtitleColor: SKY_SHELL.subtitleColor,
      statLabel: SKY_SHELL.statLabel,
      statValue: SKY_SHELL.statValue,
      statBorder: SKY_SHELL.statBorder,
      playBorder: SKY_SHELL.playBorder,
      playBg: SKY_SHELL.playBg,
      sparkleColor: SKY_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsBig="BIG TAP!"
    ttsSmall="SMALL!"
    congratsMessage={G.congrats}
    logType="big-tap-l3s4"
    skillTags={['gross-motor', 'size-awareness', 'movement-scaling']}
  />
);

export default BigTapGame;
