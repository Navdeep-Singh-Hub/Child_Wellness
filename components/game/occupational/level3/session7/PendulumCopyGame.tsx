/** OT Level 3 · Session 7 · Game 1 — Pendulum Copy · Theme: "Copy Swing" */
import { SwingMotionGame } from '@/components/game/occupational/level3/session7/SwingMotionGame';
import React from 'react';

const PendulumCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SwingMotionGame
    {...props}
    mode="pendulumCopy"
    theme={{
      title: 'Copy Swing', subtitle: 'Watch the demo, then swing side to side', emoji: '🔄',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', objectEmoji: '⚪', demoEmoji: '🔵',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6',
    }}
    ttsIntro="Watch the pendulum swing, then copy the same side-to-side motion!"
    ttsComplete="Great swing copying!"
    ttsCopyPrompt="Now copy the side-to-side swing!"
    congratsMessage="Copy Swing Star!"
    logType="pendulum-copy"
    skillTags={['motor-imitation', 'swinging-motion', 'visual-tracking']}
  />
);

export default PendulumCopyGame;
