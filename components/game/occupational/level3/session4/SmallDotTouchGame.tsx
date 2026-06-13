/** OT Level 3 · Session 4 · Game 7 — Small Dot Touch */
import { SizeGestureGame } from '@/components/game/occupational/level3/session4/SizeGestureGame';
import { GAME_THEMES, SKY_SHELL } from '@/components/game/occupational/level3/session4/skyGroundTheme';
import React from 'react';

const G = GAME_THEMES.smallDot;

const SmallDotTouchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SizeGestureGame
    {...props}
    mode="smallDot"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FAF5FF', '#F3E8FF', '#D8B4FE', '#9333EA'],
      accent: '#A855F7',
      accentDark: '#7E22CE',
      bigColor: '#C4B5FD',
      smallColor: '#7C3AED',
      backText: '#6B21A8',
      backBorder: 'rgba(168,85,247,0.25)',
      titleColor: '#581C87',
      subtitleColor: '#7E22CE',
      statLabel: '#A855F7',
      statValue: '#581C87',
      statBorder: 'rgba(168,85,247,0.2)',
      playBorder: 'rgba(168,85,247,0.25)',
      playBg: SKY_SHELL.playBg,
      sparkleColor: SKY_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsBig="BIG!"
    ttsSmall="Touch the small dot!"
    congratsMessage={G.congrats}
    logType="small-dot-touch"
    skillTags={['precision', 'finger-isolation', 'fine-motor-control']}
  />
);

export default SmallDotTouchGame;
