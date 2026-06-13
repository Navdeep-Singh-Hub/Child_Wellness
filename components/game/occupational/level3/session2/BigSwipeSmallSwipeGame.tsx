/** OT Level 3 · Session 2 · Game 2 — Swipe Scale · Giant vs Tiny Kingdom */
import { ScaleMoveGame } from '@/components/game/occupational/level3/session2/ScaleMoveGame';
import { GAME_THEMES, KINGDOM_CHARACTERS, KINGDOM_GRADIENT, KINGDOM_SHELL } from '@/components/game/occupational/level3/session2/kingdomTheme';
import React from 'react';

const G = GAME_THEMES.swipe;

const BigSwipeSmallSwipeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ScaleMoveGame
    {...props}
    mode="swipe"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#F0FDF4', '#DCFCE7', '#86EFAC', '#16A34A'],
      accent: '#22C55E',
      accentDark: '#15803D',
      bigColor: KINGDOM_SHELL.giantColor,
      smallColor: KINGDOM_SHELL.tinyColor,
      backText: KINGDOM_SHELL.backText,
      backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D',
      subtitleColor: '#15803D',
      statLabel: '#22C55E',
      statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)',
      playBorder: 'rgba(34,197,94,0.25)',
      playBg: KINGDOM_SHELL.playBg,
      sparkleColor: '#FBBF24',
      hintText: G.hintText,
      creatureEmoji: KINGDOM_CHARACTERS.king.emoji,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsBig="Make a BIG swipe!"
    ttsSmall="Make a SMALL swipe!"
    congratsMessage={G.congrats}
    logType="bigSwipeSmallSwipe"
    skillTags={['motor-planning', 'movement-scaling', 'spatial-awareness', 'force-modulation']}
  />
);

export default BigSwipeSmallSwipeGame;
