/** OT Level 3 · Session 3 · Game 10 — Move to Music */
import { SpeedGame } from '@/components/game/occupational/level3/session3/SpeedGame';
import { GAME_THEMES, TEMPO_CHARACTERS, TEMPO_SHELL } from '@/components/game/occupational/level3/session3/tempoTownTheme';
import React from 'react';

const G = GAME_THEMES.musicSpeed;

const MusicSpeedControlGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SpeedGame
    {...props}
    mode="musicSpeed"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FAF5FF', '#F3E8FF', '#D8B4FE', '#9333EA'],
      accent: '#A855F7',
      accentDark: '#7E22CE',
      characterEmoji: TEMPO_CHARACTERS.melody.emoji,
      backText: '#6B21A8',
      backBorder: 'rgba(168,85,247,0.25)',
      titleColor: '#581C87',
      subtitleColor: '#7E22CE',
      statLabel: '#A855F7',
      statValue: '#581C87',
      statBorder: 'rgba(168,85,247,0.2)',
      playBorder: 'rgba(168,85,247,0.25)',
      playBg: TEMPO_SHELL.playBg,
      sparkleColor: TEMPO_SHELL.sparkleColor,
      hintText: G.hintText,
      fastColor: TEMPO_SHELL.fastColor,
      slowColor: TEMPO_SHELL.slowColor,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsFast="Fast music — swipe quickly!"
    ttsSlow="Slow music — swipe slowly!"
    ttsTooFast="Too fast for this music!"
    ttsTooSlow="Too slow — match the beat!"
    congratsMessage={G.congrats}
    logType="music-speed-control"
    skillTags={['rhythm-synchronization', 'movement-timing', 'auditory-processing', 'motor-planning']}
  />
);

export default MusicSpeedControlGame;
