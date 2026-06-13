/** OT Level 3 · Session 8 · Game 3 — Body Build */
import { BodyMapGame } from '@/components/game/occupational/level3/session8/BodyMapGame';
import { GAME_THEMES, ROBO_SHELL } from '@/components/game/occupational/level3/session8/roboBodyTheme';
import React from 'react';

const G = GAME_THEMES.bodyPuzzle;

const BodyPuzzleGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyMapGame
    {...props}
    mode="bodyPuzzle"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#F0FDF4', '#DCFCE7', '#86EFAC', '#16A34A'],
      accent: '#22C55E',
      accentDark: '#15803D',
      backText: '#166534',
      backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D',
      subtitleColor: '#15803D',
      statLabel: '#22C55E',
      statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)',
      playBorder: 'rgba(34,197,94,0.25)',
      playBg: ROBO_SHELL.playBg,
      sparkleColor: ROBO_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsPuzzleSnap="Great fit! Robot part connected!"
    ttsPuzzleMiss="Drag it to the matching spot!"
    congratsMessage={G.congrats}
    logType="body-puzzle"
    skillTags={['spatial-awareness', 'body-structure', 'fine-motor-control', 'motor-planning']}
  />
);

export default BodyPuzzleGame;
