/** OT Level 3 · Session 4 · Game 1 — Lift Off */
import { VerticalGestureGame } from '@/components/game/occupational/level3/session4/VerticalGestureGame';
import { GAME_THEMES, SKY_CHARACTERS, SKY_GRADIENT, SKY_SHELL } from '@/components/game/occupational/level3/session4/skyGroundTheme';
import React from 'react';

const G = GAME_THEMES.swipeUp;
const C = SKY_CHARACTERS.benny;

const BalloonUpGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VerticalGestureGame
    {...props}
    mode="swipeUp"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: SKY_GRADIENT,
      accent: SKY_SHELL.accent,
      accentDark: SKY_SHELL.accentDark,
      objectEmoji: C.emoji,
      objectColors: ['#FB923C', '#EA580C'],
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
    ttsUp="Swipe UP!"
    ttsDown="Swipe DOWN!"
    ttsWrongUp="Wiggle! Try swiping UP!"
    ttsWrongDown="Swipe UP to lift!"
    congratsMessage={G.congrats}
    logType="balloon-up"
    skillTags={['vertical-awareness', 'swipe-control', 'direction-following', 'motor-planning']}
  />
);

export default BalloonUpGame;
