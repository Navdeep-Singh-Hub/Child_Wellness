/** OT Level 3 · Session 4 · Game 3 — Elevator · Theme: "Floor Express" */
import { VerticalGestureGame } from '@/components/game/occupational/level3/session4/VerticalGestureGame';
import React from 'react';

const ElevatorGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VerticalGestureGame
    {...props}
    mode="elevator"
    theme={{
      title: 'Floor Express', subtitle: 'Swipe up or down to reach the right floor', emoji: '🛗',
      gradient: ['#EEF2FF', '#E0E7FF', '#A5B4FC', '#6366F1'],
      accent: '#6366F1', accentDark: '#4338CA', objectEmoji: '🛗',
      objectColors: ['#818CF8', '#4F46E5'],
      backText: '#3730A3', backBorder: 'rgba(99,102,241,0.25)',
      titleColor: '#312E81', subtitleColor: '#4338CA', statLabel: '#6366F1', statValue: '#312E81',
      statBorder: 'rgba(99,102,241,0.2)', playBorder: 'rgba(99,102,241,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#6366F1', hintText: 'Match the floor cue!',
    }}
    ttsIntro="Swipe up for the top floor, swipe down for the ground floor!"
    ttsComplete="Elevator expert!"
    ttsUp="Swipe up to the top floor!"
    ttsDown="Swipe down to the ground floor!"
    ttsWrongUp="This floor needs a swipe up!"
    ttsWrongDown="This floor needs a swipe down!"
    congratsMessage="Elevator Pro!"
    logType="elevator-game"
    skillTags={['concept-clarity', 'up-down', 'direction-discrimination']}
  />
);

export default ElevatorGame;
