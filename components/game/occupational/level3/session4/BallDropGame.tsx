/** OT Level 3 · Session 4 · Game 2 — Ball Drop · Theme: "Gravity Drop" */
import { VerticalGestureGame } from '@/components/game/occupational/level3/session4/VerticalGestureGame';
import React from 'react';

const BallDropGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VerticalGestureGame
    {...props}
    mode="swipeDown"
    theme={{
      title: 'Gravity Drop', subtitle: 'Swipe down to drop the ball', emoji: '⚽',
      gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', objectEmoji: '⚽',
      objectColors: ['#60A5FA', '#2563EB'],
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#B45309', statLabel: '#F59E0B', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B', hintText: 'Swipe down!',
    }}
    ttsIntro="Swipe down to drop the ball!"
    ttsComplete="Great ball dropping!"
    ttsUp="Swipe up!"
    ttsDown="Swipe down to drop the ball!"
    ttsWrongUp="Try swiping down!"
    ttsWrongDown="Swipe down to drop!"
    congratsMessage="Drop Star!"
    logType="ball-drop"
    skillTags={['vertical-movement', 'direction-awareness', 'motor-planning']}
  />
);

export default BallDropGame;
