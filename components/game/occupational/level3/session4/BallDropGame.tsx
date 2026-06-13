/** OT Level 3 · Session 4 · Game 2 — Gravity Drop */
import { VerticalGestureGame } from '@/components/game/occupational/level3/session4/VerticalGestureGame';
import { GAME_THEMES, SKY_CHARACTERS, SKY_SHELL } from '@/components/game/occupational/level3/session4/skyGroundTheme';
import React from 'react';

const G = GAME_THEMES.swipeDown;

const BallDropGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VerticalGestureGame
    {...props}
    mode="swipeDown"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#F0FDF4', '#DCFCE7', '#86EFAC', '#16A34A'],
      accent: '#22C55E',
      accentDark: '#15803D',
      objectEmoji: SKY_CHARACTERS.bouncy.emoji,
      objectColors: ['#4ADE80', '#16A34A'],
      backText: '#166534',
      backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D',
      subtitleColor: '#15803D',
      statLabel: '#22C55E',
      statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)',
      playBorder: 'rgba(34,197,94,0.25)',
      playBg: SKY_SHELL.playBg,
      sparkleColor: SKY_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsUp="Swipe UP!"
    ttsDown="Swipe DOWN!"
    ttsWrongDown="Try swiping DOWN!"
    congratsMessage={G.congrats}
    logType="ball-drop"
    skillTags={['downward-direction', 'motor-planning', 'spatial-awareness']}
  />
);

export default BallDropGame;
