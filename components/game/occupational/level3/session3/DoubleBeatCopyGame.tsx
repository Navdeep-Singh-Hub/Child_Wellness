/** OT Level 3 · Session 3 · Game 2 — Two Beats */
import { DrumTapGame } from '@/components/game/occupational/level3/session3/DrumTapGame';
import { GAME_THEMES, TEMPO_SHELL } from '@/components/game/occupational/level3/session3/tempoTownTheme';
import React from 'react';

const G = GAME_THEMES.doubleBeat;

const DoubleBeatCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DrumTapGame
    {...props}
    mode="doubleBeat"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FFF7ED', '#FFEDD5', '#FDBA74', '#EA580C'],
      drumBg: '#EA580C',
      drumActive: '#C2410C',
      backText: TEMPO_SHELL.backText,
      backBorder: 'rgba(234,88,12,0.25)',
      titleColor: '#7C2D12',
      subtitleColor: '#C2410C',
      statLabel: '#EA580C',
      statValue: '#7C2D12',
      statBorder: 'rgba(234,88,12,0.2)',
      playBorder: 'rgba(234,88,12,0.25)',
      playBg: TEMPO_SHELL.playBg,
      sparkleColor: TEMPO_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    congratsMessage={G.congrats}
    logType="double-beat-copy"
    skillTags={['auditory-memory', 'sequencing', 'timing', 'rhythm-sync']}
  />
);

export default DoubleBeatCopyGame;
