/** OT Level 3 · Session 7 · Game 3 — Fan Motion · Theme: "Spin Flow" */
import { SwingMotionGame } from '@/components/game/occupational/level3/session7/SwingMotionGame';
import React from 'react';

const FanMotionGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SwingMotionGame
    {...props}
    mode="fanMotion"
    theme={{
      title: 'Spin Flow', subtitle: 'Trace a full circle around the fan', emoji: '🌀',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#22C55E'],
      accent: '#22C55E', accentDark: '#15803D', objectEmoji: '🌀',
      backText: '#166534', backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D', subtitleColor: '#16A34A', statLabel: '#22C55E', statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)', playBorder: 'rgba(34,197,94,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#22C55E',
    }}
    ttsIntro="Make a circular swinging motion! Trace a complete circle!"
    ttsComplete="Perfect circular swings!"
    ttsCircleMore="Trace a full circle around the fan!"
    congratsMessage="Spin Flow Master!"
    logType="fan-motion"
    skillTags={['circular-motion', 'swinging-motion', 'motor-planning']}
  />
);

export default FanMotionGame;
