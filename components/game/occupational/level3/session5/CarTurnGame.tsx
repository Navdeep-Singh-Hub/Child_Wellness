/** OT Level 3 · Session 5 · Game 1 — Road Turn */
import { HorizontalSwipeGame } from '@/components/game/occupational/level3/session5/HorizontalSwipeGame';
import { GAME_THEMES, ROAD_CHARACTERS, ROAD_GRADIENT, ROAD_SHELL } from '@/components/game/occupational/level3/session5/roadKingdomTheme';
import React from 'react';

const G = GAME_THEMES.carTurn;

const CarTurnGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalSwipeGame
    {...props}
    mode="carTurn"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ROAD_GRADIENT,
      accent: ROAD_SHELL.accent,
      accentDark: ROAD_SHELL.accentDark,
      objectEmoji: ROAD_CHARACTERS.rocky.emoji,
      backText: ROAD_SHELL.backText,
      backBorder: ROAD_SHELL.backBorder,
      titleColor: ROAD_SHELL.titleColor,
      subtitleColor: ROAD_SHELL.subtitleColor,
      statLabel: ROAD_SHELL.statLabel,
      statValue: ROAD_SHELL.statValue,
      statBorder: ROAD_SHELL.statBorder,
      playBorder: ROAD_SHELL.playBorder,
      playBg: ROAD_SHELL.playBg,
      sparkleColor: ROAD_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsLeft="Swipe LEFT to turn!"
    ttsRight="Swipe RIGHT to turn!"
    ttsWrongLeft="Bump! Try swiping LEFT!"
    ttsWrongRight="Bump! Try swiping RIGHT!"
    congratsMessage={G.congrats}
    logType="car-turn"
    skillTags={['direction-following', 'motor-planning', 'visual-tracking', 'lateral-awareness']}
  />
);

export default CarTurnGame;
