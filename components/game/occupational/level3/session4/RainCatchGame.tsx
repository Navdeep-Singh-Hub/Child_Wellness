/** OT Level 3 · Session 4 · Game 5 — Rain Catch · Theme: "Rain Reach" */
import { VerticalGestureGame } from '@/components/game/occupational/level3/session4/VerticalGestureGame';
import React from 'react';

const RainCatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VerticalGestureGame
    {...props}
    mode="rainCatch"
    theme={{
      title: 'Rain Reach', subtitle: 'Swipe up to raise your hands and catch the rain', emoji: '🌧️',
      gradient: ['#F0F9FF', '#E0F2FE', '#BAE6FD', '#38BDF8'],
      accent: '#38BDF8', accentDark: '#0284C7', objectEmoji: '🙌',
      objectColors: ['#7DD3FC', '#0EA5E9'],
      backText: '#0369A1', backBorder: 'rgba(56,189,248,0.25)',
      titleColor: '#0C4A6E', subtitleColor: '#0284C7', statLabel: '#38BDF8', statValue: '#0C4A6E',
      statBorder: 'rgba(56,189,248,0.2)', playBorder: 'rgba(56,189,248,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#38BDF8', hintText: 'Hands up!',
    }}
    ttsIntro="Raise your hands up to catch the rain drops!"
    ttsComplete="Great rain catching!"
    ttsUp="Hands up to catch the rain!"
    ttsDown="Swipe up with your hands!"
    ttsWrongUp="Reach up with a big swipe!"
    congratsMessage="Rain Catcher!"
    logType="rain-catch"
    skillTags={['whole-arm-coordination', 'vertical-movement', 'shoulder-movement']}
  />
);

export default RainCatchGame;
