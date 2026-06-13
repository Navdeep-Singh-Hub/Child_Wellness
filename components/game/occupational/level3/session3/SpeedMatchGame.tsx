/** OT Level 3 · Session 3 · Game 8 — Match the Pace */
import { SpeedGame } from '@/components/game/occupational/level3/session3/SpeedGame';
import { GAME_THEMES, TEMPO_CHARACTERS, TEMPO_SHELL } from '@/components/game/occupational/level3/session3/tempoTownTheme';
import React from 'react';

const G = GAME_THEMES.speedMatch;

const SpeedMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SpeedGame
    {...props}
    mode="speedMatch"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#2563EB'],
      accent: '#3B82F6',
      accentDark: '#1D4ED8',
      characterEmoji: TEMPO_CHARACTERS.toby.emoji,
      backText: TEMPO_SHELL.backText,
      backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A',
      subtitleColor: '#2563EB',
      statLabel: '#3B82F6',
      statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)',
      playBorder: 'rgba(59,130,246,0.25)',
      playBg: TEMPO_SHELL.playBg,
      sparkleColor: TEMPO_SHELL.sparkleColor,
      hintText: G.hintText,
      fastColor: TEMPO_SHELL.fastColor,
      slowColor: TEMPO_SHELL.slowColor,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsFast="Match the fast pace!"
    ttsSlow="Match the slow pace!"
    ttsTooFast="Too fast — match the guide!"
    ttsTooSlow="Too slow — match the guide!"
    congratsMessage={G.congrats}
    logType="speed-match"
    skillTags={['tempo-matching', 'observation', 'motor-control', 'speed-regulation']}
  />
);

export default SpeedMatchGame;
