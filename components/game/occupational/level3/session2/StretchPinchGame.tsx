/** OT Level 3 · Session 2 · Game 3 — Pinch & Stretch · Giant vs Tiny Kingdom */
import { ScaleMoveGame } from '@/components/game/occupational/level3/session2/ScaleMoveGame';
import { GAME_THEMES, KINGDOM_CHARACTERS, KINGDOM_SHELL } from '@/components/game/occupational/level3/session2/kingdomTheme';
import React from 'react';

const G = GAME_THEMES.pinch;

const StretchPinchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ScaleMoveGame
    {...props}
    mode="pinch"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FDF4FF', '#FAE8FF', '#E879F9', '#C026D3'],
      accent: '#D946EF',
      accentDark: '#A21CAF',
      bigColor: '#C026D3',
      smallColor: '#F472B6',
      backText: '#86198F',
      backBorder: 'rgba(217,70,239,0.25)',
      titleColor: '#701A75',
      subtitleColor: '#A21CAF',
      statLabel: '#D946EF',
      statValue: '#701A75',
      statBorder: 'rgba(217,70,239,0.2)',
      playBorder: 'rgba(217,70,239,0.25)',
      playBg: KINGDOM_SHELL.playBg,
      sparkleColor: KINGDOM_SHELL.sparkleColor,
      hintText: G.hintText,
      objectEmoji: G.objectEmoji,
      creatureEmoji: KINGDOM_CHARACTERS.bobo.emoji,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsBig="Make it BIG!"
    ttsSmall="Make it SMALL!"
    congratsMessage={G.congrats}
    logType="stretchPinch"
    skillTags={['fine-motor', 'bilateral-coordination', 'finger-isolation', 'force-modulation']}
  />
);

export default StretchPinchGame;
