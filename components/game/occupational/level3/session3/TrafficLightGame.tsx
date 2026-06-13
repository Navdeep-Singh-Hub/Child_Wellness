/** OT Level 3 · Session 3 · Game 9 — Light Rules */
import { SpeedGame } from '@/components/game/occupational/level3/session3/SpeedGame';
import { GAME_THEMES, TEMPO_CHARACTERS, TEMPO_SHELL } from '@/components/game/occupational/level3/session3/tempoTownTheme';
import React from 'react';

const G = GAME_THEMES.trafficLight;

const TrafficLightGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SpeedGame
    {...props}
    mode="trafficLight"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FEFCE8', '#FEF9C3', '#FDE047', '#CA8A04'],
      accent: '#EAB308',
      accentDark: '#A16207',
      characterEmoji: TEMPO_CHARACTERS.captain.emoji,
      backText: '#854D0E',
      backBorder: 'rgba(234,179,8,0.25)',
      titleColor: '#713F12',
      subtitleColor: '#A16207',
      statLabel: '#CA8A04',
      statValue: '#713F12',
      statBorder: 'rgba(202,138,4,0.2)',
      playBorder: 'rgba(202,138,4,0.25)',
      playBg: TEMPO_SHELL.playBg,
      sparkleColor: TEMPO_SHELL.sparkleColor,
      hintText: G.hintText,
      fastColor: '#22C55E',
      slowColor: '#EAB308',
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsFast="Green light — go fast!"
    ttsSlow="Yellow light — go slow!"
    ttsStop="Red light — stop!"
    congratsMessage={G.congrats}
    logType="traffic-light-game"
    skillTags={['cognitive-flexibility', 'speed-regulation', 'rule-following', 'impulse-control']}
  />
);

export default TrafficLightGame;
