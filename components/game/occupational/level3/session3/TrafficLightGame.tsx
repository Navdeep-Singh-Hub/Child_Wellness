/** OT Level 3 · Session 3 · Game 9 — Traffic Light · Theme: "Light Rules" */
import { SpeedGame } from '@/components/game/occupational/level3/session3/SpeedGame';
import React from 'react';

const TrafficLightGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SpeedGame
    {...props}
    mode="trafficLight"
    theme={{
      title: 'Light Rules', subtitle: 'Green = fast swipe, yellow = slow swipe', emoji: '🚦',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C', characterEmoji: '🚦',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#DC2626', statLabel: '#EF4444', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444', hintText: 'Follow the light!',
      fastColor: '#22C55E', slowColor: '#EAB308',
    }}
    ttsIntro="Green light means swipe fast! Yellow light means swipe slow!"
    ttsComplete="Great traffic rules!"
    ttsFast="Green light! Go fast!"
    ttsSlow="Yellow light! Go slow!"
    ttsTooFast="That was too fast for yellow!"
    ttsTooSlow="That was too slow for green!"
    congratsMessage="Traffic Star!"
    logType="traffic-light-game"
    skillTags={['rule-following', 'response-inhibition', 'speed-control']}
  />
);

export default TrafficLightGame;
