/** OT Level 3 · Session 2 · Game 1 — Size Tap · Giant vs Tiny Kingdom */
import { ScaleMoveGame } from '@/components/game/occupational/level3/session2/ScaleMoveGame';
import { GAME_THEMES, KINGDOM_CHARACTERS, KINGDOM_GRADIENT, KINGDOM_SHELL } from '@/components/game/occupational/level3/session2/kingdomTheme';
import React from 'react';

const G = GAME_THEMES.tap;
const C = KINGDOM_CHARACTERS.gogo;

const BigTapSmallTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ScaleMoveGame
    {...props}
    mode="tap"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: KINGDOM_GRADIENT,
      accent: KINGDOM_SHELL.accent,
      accentDark: KINGDOM_SHELL.accentDark,
      bigColor: KINGDOM_SHELL.giantColor,
      smallColor: KINGDOM_SHELL.tinyColor,
      backText: KINGDOM_SHELL.backText,
      backBorder: KINGDOM_SHELL.backBorder,
      titleColor: KINGDOM_SHELL.titleColor,
      subtitleColor: KINGDOM_SHELL.subtitleColor,
      statLabel: KINGDOM_SHELL.statLabel,
      statValue: KINGDOM_SHELL.statValue,
      statBorder: KINGDOM_SHELL.statBorder,
      playBorder: KINGDOM_SHELL.playBorder,
      playBg: KINGDOM_SHELL.playBg,
      sparkleColor: KINGDOM_SHELL.sparkleColor,
      hintText: G.hintText,
      creatureEmoji: C.emoji,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsBig="Tap the BIG circle!"
    ttsSmall="Tap the SMALL circle!"
    congratsMessage={G.congrats}
    logType="bigTapSmallTap"
    skillTags={['motor-planning', 'size-discrimination', 'visual-motor-integration', 'attention']}
  />
);

export default BigTapSmallTapGame;
