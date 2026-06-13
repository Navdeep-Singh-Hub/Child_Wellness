/** OT Level 3 · Session 8 · Game 2 — Shoulder Pick */
import { BodyMapGame } from '@/components/game/occupational/level3/session8/BodyMapGame';
import { GAME_THEMES, ROBO_SHELL } from '@/components/game/occupational/level3/session8/roboBodyTheme';
import React from 'react';

const G = GAME_THEMES.shouldersTap;

const ShouldersTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyMapGame
    {...props}
    mode="shouldersTap"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FFFBEB', '#FEF3C7', '#FDE047', '#CA8A04'],
      accent: '#EAB308',
      accentDark: '#A16207',
      backText: '#854D0E',
      backBorder: 'rgba(234,179,8,0.25)',
      titleColor: '#713F12',
      subtitleColor: '#A16207',
      statLabel: '#CA8A04',
      statValue: '#713F12',
      statBorder: 'rgba(202,138,4,0.2)',
      playBorder: 'rgba(202,138,4,0.25)',
      playBg: ROBO_SHELL.playBg,
      sparkleColor: ROBO_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsShoulder="Touch the highlighted body part!"
    ttsWrongShoulder="Try the other side!"
    congratsMessage={G.congrats}
    logType="shoulders-tap"
    skillTags={['laterality-awareness', 'body-mapping', 'left-right-discrimination']}
  />
);

export default ShouldersTapGame;
