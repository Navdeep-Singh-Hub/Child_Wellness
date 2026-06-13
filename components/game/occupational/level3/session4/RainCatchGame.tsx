/** OT Level 3 · Session 4 · Game 5 — Rain Reach */
import { VerticalGestureGame } from '@/components/game/occupational/level3/session4/VerticalGestureGame';
import { GAME_THEMES, SKY_CHARACTERS, SKY_SHELL } from '@/components/game/occupational/level3/session4/skyGroundTheme';
import React from 'react';

const G = GAME_THEMES.rainCatch;

const RainCatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VerticalGestureGame
    {...props}
    mode="rainCatch"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#F0F9FF', '#E0F2FE', '#7DD3FC', '#0284C7'],
      accent: '#38BDF8',
      accentDark: '#0284C7',
      objectEmoji: SKY_CHARACTERS.rainy.emoji,
      objectColors: ['#7DD3FC', '#0EA5E9'],
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
    ttsUp="Reach UP to catch!"
    ttsDown="Swipe UP!"
    congratsMessage={G.congrats}
    logType="rain-catch"
    skillTags={['upward-movement', 'hand-eye-coordination', 'tracking', 'attention']}
  />
);

export default RainCatchGame;
