/** OT Level 3 · Session 5 · Game 1 — Car Turn · Theme: "Road Turn" */
import { HorizontalSwipeGame } from '@/components/game/occupational/level3/session5/HorizontalSwipeGame';
import React from 'react';

const CarTurnGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalSwipeGame
    {...props}
    mode="carTurn"
    theme={{
      title: 'Road Turn', subtitle: 'Swipe left or right to turn the car', emoji: '🚗',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', objectEmoji: '🚗',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6', hintText: 'Match the turn direction!',
    }}
    ttsIntro="Swipe left to turn left, swipe right to turn right!"
    ttsComplete="Great driving!"
    ttsLeft="Swipe left to turn the car left!"
    ttsRight="Swipe right to turn the car right!"
    ttsWrongLeft="Try swiping left!"
    ttsWrongRight="Try swiping right!"
    congratsMessage="Road Master!"
    logType="car-turn"
    skillTags={['direction-discrimination', 'lateral-movement', 'motor-planning']}
  />
);

export default CarTurnGame;
