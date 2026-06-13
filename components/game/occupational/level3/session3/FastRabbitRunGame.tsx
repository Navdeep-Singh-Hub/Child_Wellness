/** OT Level 3 · Session 3 · Game 7 — Quick Hop */
import { SpeedGame } from '@/components/game/occupational/level3/session3/SpeedGame';
import { GAME_THEMES, TEMPO_CHARACTERS, TEMPO_SHELL } from '@/components/game/occupational/level3/session3/tempoTownTheme';
import React from 'react';

const G = GAME_THEMES.dragFast;

const FastRabbitRunGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SpeedGame
    {...props}
    mode="dragFast"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FDF2F8', '#FCE7F3', '#F9A8D4', '#EC4899'],
      accent: '#EC4899',
      accentDark: '#BE185D',
      characterEmoji: TEMPO_CHARACTERS.ruby.emoji,
      backText: '#9D174D',
      backBorder: 'rgba(236,72,153,0.25)',
      titleColor: '#831843',
      subtitleColor: '#BE185D',
      statLabel: '#EC4899',
      statValue: '#831843',
      statBorder: 'rgba(236,72,153,0.2)',
      playBorder: 'rgba(236,72,153,0.25)',
      playBg: TEMPO_SHELL.playBg,
      sparkleColor: TEMPO_SHELL.sparkleColor,
      hintText: G.hintText,
      fastColor: TEMPO_SHELL.fastColor,
      slowColor: TEMPO_SHELL.slowColor,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsFast="Hop Ruby quickly!"
    ttsSlow="Too slow — hurry!"
    ttsTooSlow="Time ran out — try faster!"
    congratsMessage={G.congrats}
    logType="fast-rabbit-run"
    skillTags={['fast-motor-response', 'planning', 'coordination', 'reaction-speed']}
  />
);

export default FastRabbitRunGame;
