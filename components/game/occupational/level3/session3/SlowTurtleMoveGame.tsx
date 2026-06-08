/** OT Level 3 · Session 3 · Game 6 — Slow Turtle Move · Theme: "Slow & Steady" */
import { SpeedGame } from '@/components/game/occupational/level3/session3/SpeedGame';
import React from 'react';

const SlowTurtleMoveGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SpeedGame
    {...props}
    mode="dragSlow"
    theme={{
      title: 'Slow & Steady', subtitle: 'Drag the turtle slowly to the finish', emoji: '🐢',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      accent: '#10B981', accentDark: '#047857', characterEmoji: '🐢',
      backText: '#047857', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#065F46', subtitleColor: '#059669', statLabel: '#10B981', statValue: '#065F46',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981', hintText: 'Drag slowly — no rushing!',
      fastColor: '#22C55E', slowColor: '#3B82F6',
    }}
    ttsIntro="Drag the turtle slowly to the finish line!"
    ttsComplete="Slow and steady wins!"
    ttsFast="Go fast!"
    ttsSlow="Move the turtle slowly!"
    ttsTooFast="Move the turtle more slowly!"
    congratsMessage="Turtle Pro!"
    logType="slow-turtle-move"
    skillTags={['patience', 'controlled-motion', 'force-grading']}
  />
);

export default SlowTurtleMoveGame;
