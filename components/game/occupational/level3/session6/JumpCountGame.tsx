/** OT Level 3 · Session 6 · Game 2 — Two Jump */
import { JumpTapGame } from '@/components/game/occupational/level3/session6/JumpTapGame';
import { GAME_THEMES, POND_CHARACTERS, POND_SHELL } from '@/components/game/occupational/level3/session6/jumpPondTheme';
import React from 'react';

const G = GAME_THEMES.jumpCount;

const JumpCountGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <JumpTapGame
    {...props}
    mode="jumpCount"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#2563EB'],
      accent: '#3B82F6',
      accentDark: '#1D4ED8',
      objectEmoji: POND_CHARACTERS.hopper.emoji,
      backText: '#1E3A8A',
      backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A',
      subtitleColor: '#2563EB',
      statLabel: '#3B82F6',
      statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)',
      playBorder: 'rgba(59,130,246,0.25)',
      playBg: POND_SHELL.playBg,
      sparkleColor: POND_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsNumberTwo="Number 2! Now jump!"
    ttsNumberOther="Don't jump!"
    ttsWrongNumber="Only jump on number 2!"
    congratsMessage={G.congrats}
    logType="jump-count"
    skillTags={['inhibition', 'number-recognition', 'response-control', 'executive-function']}
  />
);

export default JumpCountGame;
