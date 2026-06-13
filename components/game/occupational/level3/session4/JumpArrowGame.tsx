/** OT Level 3 · Session 4 · Game 4 — Arrow Jump */
import { VerticalGestureGame } from '@/components/game/occupational/level3/session4/VerticalGestureGame';
import { GAME_THEMES, SKY_CHARACTERS, SKY_SHELL } from '@/components/game/occupational/level3/session4/skyGroundTheme';
import React from 'react';

const G = GAME_THEMES.arrowMatch;

const JumpArrowGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VerticalGestureGame
    {...props}
    mode="arrowMatch"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FFFBEB', '#FEF3C7', '#FDE047', '#EAB308'],
      accent: '#EAB308',
      accentDark: '#A16207',
      objectEmoji: SKY_CHARACTERS.eagle.emoji,
      objectColors: ['#FCD34D', '#D97706'],
      backText: '#854D0E',
      backBorder: 'rgba(234,179,8,0.25)',
      titleColor: '#713F12',
      subtitleColor: '#A16207',
      statLabel: '#CA8A04',
      statValue: '#713F12',
      statBorder: 'rgba(202,138,4,0.2)',
      playBorder: 'rgba(202,138,4,0.25)',
      playBg: SKY_SHELL.playBg,
      sparkleColor: SKY_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsUp="Swipe UP!"
    ttsDown="Swipe DOWN!"
    congratsMessage={G.congrats}
    logType="jump-arrow"
    skillTags={['direction-discrimination', 'reaction-time', 'visual-processing']}
  />
);

export default JumpArrowGame;
