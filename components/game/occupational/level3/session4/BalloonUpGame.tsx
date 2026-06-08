/** OT Level 3 · Session 4 · Game 1 — Balloon Up · Theme: "Lift Off" */
import { VerticalGestureGame } from '@/components/game/occupational/level3/session4/VerticalGestureGame';
import React from 'react';

const BalloonUpGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VerticalGestureGame
    {...props}
    mode="swipeUp"
    theme={{
      title: 'Lift Off', subtitle: 'Swipe up to lift the balloon', emoji: '🎈',
      gradient: ['#E0F2FE', '#BAE6FD', '#7DD3FC', '#0EA5E9'],
      accent: '#0EA5E9', accentDark: '#0369A1', objectEmoji: '🎈',
      objectColors: ['#FB923C', '#EA580C'],
      backText: '#075985', backBorder: 'rgba(14,165,233,0.25)',
      titleColor: '#0C4A6E', subtitleColor: '#0369A1', statLabel: '#0EA5E9', statValue: '#0C4A6E',
      statBorder: 'rgba(14,165,233,0.2)', playBorder: 'rgba(14,165,233,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#0EA5E9', hintText: 'Swipe up!',
    }}
    ttsIntro="Swipe up to lift the balloon into the sky!"
    ttsComplete="Great balloon lifting!"
    ttsUp="Swipe up to lift the balloon!"
    ttsDown="Swipe down!"
    ttsWrongUp="Try swiping up!"
    ttsWrongDown="Swipe up to lift!"
    congratsMessage="Sky High!"
    logType="balloon-up"
    skillTags={['direction-awareness', 'shoulder-movement', 'vertical-gestures']}
  />
);

export default BalloonUpGame;
