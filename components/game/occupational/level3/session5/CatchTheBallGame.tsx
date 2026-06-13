/** OT Level 3 · Session 5 · Game 5 — Quick Catch */
import { HorizontalSwipeGame } from '@/components/game/occupational/level3/session5/HorizontalSwipeGame';
import { GAME_THEMES, ROAD_CHARACTERS, ROAD_SHELL } from '@/components/game/occupational/level3/session5/roadKingdomTheme';
import React from 'react';

const G = GAME_THEMES.catchBall;

const CatchTheBallGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalSwipeGame
    {...props}
    mode="catchBall"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#F0FDF4', '#DCFCE7', '#86EFAC', '#16A34A'],
      accent: '#22C55E',
      accentDark: '#15803D',
      objectEmoji: ROAD_CHARACTERS.bounce.emoji,
      backText: '#166534',
      backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D',
      subtitleColor: '#15803D',
      statLabel: '#22C55E',
      statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)',
      playBorder: 'rgba(34,197,94,0.25)',
      playBg: ROAD_SHELL.playBg,
      sparkleColor: ROAD_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsLeft="Catch from the LEFT!"
    ttsRight="Catch from the RIGHT!"
    congratsMessage={G.congrats}
    logType="catch-the-ball"
    skillTags={['visual-tracking', 'reaction-timing', 'direction-recognition']}
  />
);

export default CatchTheBallGame;
