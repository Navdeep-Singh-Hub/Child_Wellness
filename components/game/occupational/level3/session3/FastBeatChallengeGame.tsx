/** OT Level 3 · Session 3 · Game 4 — Beat Sprint */
import { DrumTapGame } from '@/components/game/occupational/level3/session3/DrumTapGame';
import { GAME_THEMES, TEMPO_SHELL } from '@/components/game/occupational/level3/session3/tempoTownTheme';
import React from 'react';

const G = GAME_THEMES.fastBeat;

const FastBeatChallengeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DrumTapGame
    {...props}
    mode="fastBeat"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FEF2F2', '#FEE2E2', '#FCA5A5', '#EF4444'],
      drumBg: '#EF4444',
      drumActive: '#DC2626',
      backText: '#991B1B',
      backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D',
      subtitleColor: '#DC2626',
      statLabel: '#EF4444',
      statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)',
      playBorder: 'rgba(239,68,68,0.25)',
      playBg: TEMPO_SHELL.playBg,
      sparkleColor: '#FBBF24',
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    congratsMessage={G.congrats}
    logType="fast-beat-challenge"
    skillTags={['reaction-speed', 'timing-accuracy', 'rhythm-tracking', 'motor-planning']}
  />
);

export default FastBeatChallengeGame;
