/** OT Level 3 · Session 4 · Game 8 — Big-Small Switch */
import { SizeGestureGame } from '@/components/game/occupational/level3/session4/SizeGestureGame';
import { GAME_THEMES, SKY_SHELL } from '@/components/game/occupational/level3/session4/skyGroundTheme';
import React from 'react';

const G = GAME_THEMES.bigSmallSwitch;

const BigSmallSwitchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SizeGestureGame
    {...props}
    mode="bigSmallSwitch"
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
      playBg: SKY_SHELL.playBg,
      sparkleColor: SKY_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsBig="BIG!"
    ttsSmall="SMALL!"
    congratsMessage={G.congrats}
    logType="big-small-switch"
    skillTags={['cognitive-flexibility', 'motor-planning', 'movement-regulation']}
  />
);

export default BigSmallSwitchGame;
