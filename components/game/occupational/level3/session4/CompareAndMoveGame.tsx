/** OT Level 3 · Session 4 · Game 10 — Compare & Move */
import { SizeGestureGame } from '@/components/game/occupational/level3/session4/SizeGestureGame';
import { GAME_THEMES, SKY_SHELL } from '@/components/game/occupational/level3/session4/skyGroundTheme';
import React from 'react';

const G = GAME_THEMES.compareMove;

const CompareAndMoveGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SizeGestureGame
    {...props}
    mode="compareMove"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#ECFEFF', '#CFFAFE', '#67E8F9', '#0891B2'],
      accent: '#06B6D4',
      accentDark: '#0E7490',
      bigColor: '#0891B2',
      smallColor: '#A5F3FC',
      backText: '#155E75',
      backBorder: 'rgba(6,182,212,0.25)',
      titleColor: '#164E63',
      subtitleColor: '#0E7490',
      statLabel: '#06B6D4',
      statValue: '#164E63',
      statBorder: 'rgba(6,182,212,0.2)',
      playBorder: 'rgba(6,182,212,0.25)',
      playBg: SKY_SHELL.playBg,
      sparkleColor: SKY_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsBig="BIG swipe!"
    ttsSmall="Small swipe!"
    congratsMessage={G.congrats}
    logType="compare-and-move"
    skillTags={['visual-comparison', 'movement-scaling', 'decision-making']}
  />
);

export default CompareAndMoveGame;
