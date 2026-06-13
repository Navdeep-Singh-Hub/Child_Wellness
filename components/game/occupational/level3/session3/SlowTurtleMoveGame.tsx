/** OT Level 3 · Session 3 · Game 6 — Slow & Steady */
import { SpeedGame } from '@/components/game/occupational/level3/session3/SpeedGame';
import { GAME_THEMES, TEMPO_CHARACTERS, TEMPO_SHELL } from '@/components/game/occupational/level3/session3/tempoTownTheme';
import React from 'react';

const G = GAME_THEMES.dragSlow;

const SlowTurtleMoveGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SpeedGame
    {...props}
    mode="dragSlow"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#F0FDF4', '#DCFCE7', '#86EFAC', '#16A34A'],
      accent: '#22C55E',
      accentDark: '#15803D',
      characterEmoji: TEMPO_CHARACTERS.toby.emoji,
      backText: '#166534',
      backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D',
      subtitleColor: '#15803D',
      statLabel: '#22C55E',
      statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)',
      playBorder: 'rgba(34,197,94,0.25)',
      playBg: TEMPO_SHELL.playBg,
      sparkleColor: TEMPO_SHELL.sparkleColor,
      hintText: G.hintText,
      fastColor: TEMPO_SHELL.fastColor,
      slowColor: TEMPO_SHELL.slowColor,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsFast="Too fast!"
    ttsSlow="Move Toby slowly to the finish!"
    ttsTooFast="Toby stumbled — go slower!"
    congratsMessage={G.congrats}
    logType="slow-turtle-move"
    skillTags={['controlled-movement', 'speed-awareness', 'precision', 'motor-planning']}
  />
);

export default SlowTurtleMoveGame;
