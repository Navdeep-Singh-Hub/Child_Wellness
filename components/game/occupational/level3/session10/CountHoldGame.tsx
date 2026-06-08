/** OT Level 3 · Session 10 · Game 5 — Count Hold · Theme: "Count Still" */
import { PostureGame } from '@/components/game/occupational/level3/session10/PostureGame';
import React from 'react';

const CountHoldGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureGame
    {...props}
    mode="countHold"
    theme={{
      title: 'Count Still', subtitle: 'Hold the pose while counting down', emoji: '🔢',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', confirmBg: '#7C3AED',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#7C3AED', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6',
    }}
    ttsIntro="Hold each pose while we count from five to zero!"
    ttsComplete="Count still master!"
    ttsHold="Hold for five seconds!"
    ttsHoldDone="Perfect!"
    congratsMessage="Count Still Hero!"
    logType="count-hold"
    skillTags={['balance', 'endurance', 'posture']}
  />
);

export default CountHoldGame;
