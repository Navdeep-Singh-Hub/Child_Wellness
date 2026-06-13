/** OT Level 3 · Session 3 · Game 1 — One Beat */
import { DrumTapGame } from '@/components/game/occupational/level3/session3/DrumTapGame';
import { GAME_THEMES, TEMPO_GRADIENT, TEMPO_SHELL } from '@/components/game/occupational/level3/session3/tempoTownTheme';
import React from 'react';

const G = GAME_THEMES.singleBeat;

const SingleBeatTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DrumTapGame
    {...props}
    mode="singleBeat"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: TEMPO_GRADIENT,
      drumBg: TEMPO_SHELL.drumBg,
      drumActive: TEMPO_SHELL.drumActive,
      backText: TEMPO_SHELL.backText,
      backBorder: TEMPO_SHELL.backBorder,
      titleColor: TEMPO_SHELL.titleColor,
      subtitleColor: TEMPO_SHELL.subtitleColor,
      statLabel: TEMPO_SHELL.statLabel,
      statValue: TEMPO_SHELL.statValue,
      statBorder: TEMPO_SHELL.statBorder,
      playBorder: TEMPO_SHELL.playBorder,
      playBg: TEMPO_SHELL.playBg,
      sparkleColor: TEMPO_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    congratsMessage={G.congrats}
    logType="single-beat-tap"
    skillTags={['timing', 'impulse-control', 'attention', 'rhythm-sync']}
  />
);

export default SingleBeatTapGame;
