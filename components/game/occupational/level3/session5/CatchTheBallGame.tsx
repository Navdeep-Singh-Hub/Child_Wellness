/** OT Level 3 · Session 5 · Game 5 — Catch the Ball · Theme: "Quick Catch" */
import { HorizontalSwipeGame } from '@/components/game/occupational/level3/session5/HorizontalSwipeGame';
import React from 'react';

const CatchTheBallGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalSwipeGame
    {...props}
    mode="catchBall"
    theme={{
      title: 'Quick Catch', subtitle: 'Ball from the left or right — swipe to catch!', emoji: '⚽',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C', objectEmoji: '⚽',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#DC2626', statLabel: '#EF4444', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444', hintText: 'Match the ball direction!',
    }}
    ttsIntro="Watch which side the ball comes from and swipe that way to catch it!"
    ttsComplete="Great catching!"
    ttsLeft="Ball from the left — swipe left!"
    ttsRight="Ball from the right — swipe right!"
    ttsWrongLeft="The ball came from the left — swipe left!"
    ttsWrongRight="The ball came from the right — swipe right!"
    congratsMessage="Catch Champion!"
    logType="catch-the-ball"
    skillTags={['reaction-time', 'direction-discrimination', 'lateral-movement']}
  />
);

export default CatchTheBallGame;
