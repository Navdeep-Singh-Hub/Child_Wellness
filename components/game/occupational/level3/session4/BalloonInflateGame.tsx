/** OT Level 3 · Session 4 · Game 9 — Balloon Inflate */
import { SizeGestureGame } from '@/components/game/occupational/level3/session4/SizeGestureGame';
import { GAME_THEMES, SKY_CHARACTERS, SKY_SHELL } from '@/components/game/occupational/level3/session4/skyGroundTheme';
import React from 'react';

const G = GAME_THEMES.balloonInflate;

const BalloonInflateGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SizeGestureGame
    {...props}
    mode="balloonInflate"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#F97316',
      accentDark: '#EA580C',
      bigColor: '#FB923C',
      smallColor: '#FDBA74',
      backText: '#9A3412',
      backBorder: 'rgba(249,115,22,0.25)',
      titleColor: '#7C2D12',
      subtitleColor: '#C2410C',
      statLabel: '#EA580C',
      statValue: '#7C2D12',
      statBorder: 'rgba(249,115,22,0.2)',
      playBorder: 'rgba(249,115,22,0.25)',
      playBg: SKY_SHELL.playBg,
      sparkleColor: SKY_SHELL.sparkleColor,
      hintText: G.hintText,
      objectEmoji: SKY_CHARACTERS.benny.emoji,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsBig="Make it BIG!"
    ttsSmall="Make it SMALL!"
    congratsMessage={G.congrats}
    logType="balloon-inflate-l3s4"
    skillTags={['size-control', 'bilateral-coordination', 'gesture-planning']}
  />
);

export default BalloonInflateGame;
