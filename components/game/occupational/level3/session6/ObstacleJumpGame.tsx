/** OT Level 3 · Session 6 · Game 5 — Rock Hop */
import { JumpTapGame } from '@/components/game/occupational/level3/session6/JumpTapGame';
import { GAME_THEMES, POND_CHARACTERS, POND_SHELL } from '@/components/game/occupational/level3/session6/jumpPondTheme';
import React from 'react';

const G = GAME_THEMES.obstacleJump;

const ObstacleJumpGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <JumpTapGame
    {...props}
    mode="obstacleJump"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FFFBEB', '#FEF3C7', '#FDE047', '#CA8A04'],
      accent: '#EAB308',
      accentDark: '#A16207',
      objectEmoji: POND_CHARACTERS.freddy.emoji,
      obstacleEmoji: POND_CHARACTERS.rocky.emoji,
      backText: '#854D0E',
      backBorder: 'rgba(234,179,8,0.25)',
      titleColor: '#713F12',
      subtitleColor: '#A16207',
      statLabel: '#CA8A04',
      statValue: '#713F12',
      statBorder: 'rgba(202,138,4,0.2)',
      playBorder: 'rgba(202,138,4,0.25)',
      playBg: POND_SHELL.playBg,
      sparkleColor: POND_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsObstacleMiss="Jump over the rock with a double tap!"
    congratsMessage={G.congrats}
    logType="obstacle-jump"
    skillTags={['reaction-timing', 'motor-planning', 'sequencing', 'visual-motor']}
  />
);

export default ObstacleJumpGame;
