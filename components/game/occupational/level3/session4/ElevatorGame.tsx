/** OT Level 3 · Session 4 · Game 3 — Floor Express */
import { VerticalGestureGame } from '@/components/game/occupational/level3/session4/VerticalGestureGame';
import { GAME_THEMES, SKY_CHARACTERS, SKY_SHELL } from '@/components/game/occupational/level3/session4/skyGroundTheme';
import React from 'react';

const G = GAME_THEMES.elevator;

const ElevatorGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VerticalGestureGame
    {...props}
    mode="elevator"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#EEF2FF', '#E0E7FF', '#A5B4FC', '#6366F1'],
      accent: '#6366F1',
      accentDark: '#4F46E5',
      objectEmoji: SKY_CHARACTERS.ellie.emoji,
      objectColors: ['#818CF8', '#4F46E5'],
      backText: '#3730A3',
      backBorder: 'rgba(99,102,241,0.25)',
      titleColor: '#312E81',
      subtitleColor: '#4F46E5',
      statLabel: '#6366F1',
      statValue: '#312E81',
      statBorder: 'rgba(99,102,241,0.2)',
      playBorder: 'rgba(99,102,241,0.25)',
      playBg: SKY_SHELL.playBg,
      sparkleColor: SKY_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsUp="Go UP!"
    ttsDown="Go DOWN!"
    congratsMessage={G.congrats}
    logType="elevator-game"
    skillTags={['sequencing', 'vertical-direction', 'planning', 'executive-function']}
  />
);

export default ElevatorGame;
