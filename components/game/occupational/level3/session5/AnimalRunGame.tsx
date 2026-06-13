/** OT Level 3 · Session 5 · Game 3 — Pet Dash */
import { HorizontalSwipeGame } from '@/components/game/occupational/level3/session5/HorizontalSwipeGame';
import { GAME_THEMES, ROAD_CHARACTERS, ROAD_SHELL } from '@/components/game/occupational/level3/session5/roadKingdomTheme';
import React from 'react';

const G = GAME_THEMES.animalRun;

const AnimalRunGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalSwipeGame
    {...props}
    mode="animalRun"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FFFBEB', '#FEF3C7', '#FDE047', '#CA8A04'],
      accent: '#EAB308',
      accentDark: '#A16207',
      objectEmoji: ROAD_CHARACTERS.dash.emoji,
      backText: '#854D0E',
      backBorder: 'rgba(234,179,8,0.25)',
      titleColor: '#713F12',
      subtitleColor: '#A16207',
      statLabel: '#CA8A04',
      statValue: '#713F12',
      statBorder: 'rgba(202,138,4,0.2)',
      playBorder: 'rgba(202,138,4,0.25)',
      playBg: ROAD_SHELL.playBg,
      sparkleColor: ROAD_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsLeft="Send Dash LEFT!"
    ttsRight="Send Dash RIGHT!"
    congratsMessage={G.congrats}
    logType="animal-run"
    skillTags={['direction-following', 'listening', 'motor-execution', 'bilateral-awareness']}
  />
);

export default AnimalRunGame;
