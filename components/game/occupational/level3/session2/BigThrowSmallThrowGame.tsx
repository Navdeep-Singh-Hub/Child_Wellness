/** OT Level 3 · Session 2 · Game 4 — Throw Range · Giant vs Tiny Kingdom */
import { ScaleMoveGame } from '@/components/game/occupational/level3/session2/ScaleMoveGame';
import { GAME_THEMES, KINGDOM_SHELL } from '@/components/game/occupational/level3/session2/kingdomTheme';
import React from 'react';

const G = GAME_THEMES.throw;

const BigThrowSmallThrowGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ScaleMoveGame
    {...props}
    mode="throw"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FFF7ED', '#FFEDD5', '#FDBA74', '#EA580C'],
      accent: '#F97316',
      accentDark: '#C2410C',
      bigColor: '#EA580C',
      smallColor: '#FBBF24',
      backText: '#9A3412',
      backBorder: 'rgba(249,115,22,0.25)',
      titleColor: '#7C2D12',
      subtitleColor: '#C2410C',
      statLabel: '#EA580C',
      statValue: '#7C2D12',
      statBorder: 'rgba(249,115,22,0.2)',
      playBorder: 'rgba(249,115,22,0.25)',
      playBg: KINGDOM_SHELL.playBg,
      sparkleColor: KINGDOM_SHELL.sparkleColor,
      hintText: G.hintText,
      objectEmoji: G.objectEmoji,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsBig="Throw it FAR!"
    ttsSmall="Throw it NEAR!"
    congratsMessage={G.congrats}
    logType="bigThrowSmallThrow"
    skillTags={['force-modulation', 'distance-judgment', 'motor-planning', 'hand-control']}
  />
);

export default BigThrowSmallThrowGame;
