/** OT Level 3 · Session 3 · Game 5 — Calm Beats */
import { DrumTapGame } from '@/components/game/occupational/level3/session3/DrumTapGame';
import { GAME_THEMES, TEMPO_SHELL } from '@/components/game/occupational/level3/session3/tempoTownTheme';
import React from 'react';

const G = GAME_THEMES.slowBeat;

const SlowBeatCalmModeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DrumTapGame
    {...props}
    mode="slowBeat"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#059669'],
      drumBg: '#059669',
      drumActive: '#047857',
      backText: '#065F46',
      backBorder: 'rgba(5,150,105,0.25)',
      titleColor: '#064E3B',
      subtitleColor: '#047857',
      statLabel: '#10B981',
      statValue: '#064E3B',
      statBorder: 'rgba(16,185,129,0.2)',
      playBorder: 'rgba(16,185,129,0.25)',
      playBg: TEMPO_SHELL.playBg,
      sparkleColor: '#A7F3D0',
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    congratsMessage={G.congrats}
    logType="slow-beat-calm-mode"
    skillTags={['self-control', 'regulation', 'attention', 'speed-regulation']}
  />
);

export default SlowBeatCalmModeGame;
