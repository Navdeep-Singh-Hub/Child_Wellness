/** OT Level 3 · Session 3 · Game 3 — Wait & Tap */
import { DrumTapGame } from '@/components/game/occupational/level3/session3/DrumTapGame';
import { GAME_THEMES, TEMPO_SHELL } from '@/components/game/occupational/level3/session3/tempoTownTheme';
import React from 'react';

const G = GAME_THEMES.pauseTap;

const PauseAndTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DrumTapGame
    {...props}
    mode="pauseTap"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#7C3AED'],
      drumBg: '#7C3AED',
      drumActive: '#6D28D9',
      backText: '#5B21B6',
      backBorder: 'rgba(124,58,237,0.25)',
      titleColor: '#4C1D95',
      subtitleColor: '#6D28D9',
      statLabel: '#8B5CF6',
      statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)',
      playBorder: 'rgba(139,92,246,0.25)',
      playBg: TEMPO_SHELL.playBg,
      sparkleColor: TEMPO_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    congratsMessage={G.congrats}
    logType="pause-and-tap"
    skillTags={['response-inhibition', 'self-regulation', 'patience', 'attention']}
  />
);

export default PauseAndTapGame;
