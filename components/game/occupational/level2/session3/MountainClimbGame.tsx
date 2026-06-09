/**
 * OT Level 2 · Session 3 · Game 1 — Mountain Climb
 * Theme: "Peak Path"
 */
import { PolylineTraceGame } from '@/components/game/occupational/level2/session3/PolylineTraceGame';
import { makeDiagonalZigZag } from '@/components/game/occupational/level2/session3/traceUtils';
import React from 'react';

const MountainClimbGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PolylineTraceGame
    {...props}
    theme={{
      title: 'Peak Path',
      subtitle: 'Climb the zig-zag trail up the mountain',
      emoji: '⛰️',
      sceneId: 'mountain',
      gradient: ['#ECFDF5', '#D1FAE5', '#86EFAC', '#4ADE80'],
      trackStroke: 'rgba(22,163,74,0.2)',
      progressStroke: '#16A34A',
      pathGradient: ['#6EE7B7', '#22C55E', '#15803D'],
      backText: '#047857',
      backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#047857',
      subtitleColor: '#059669',
      statLabel: '#059669',
      statValue: '#047857',
      statBorder: 'rgba(16,185,129,0.2)',
      playBorder: 'rgba(16,185,129,0.3)',
      playBg: 'rgba(167,243,208,0.5)',
      progressFill: '#16A34A',
      objColors: ['#6EE7B7', '#16A34A'],
      objGlow: '#22C55E',
      sparkleColor: '#34D399',
      traceHint: 'Climb up!',
    }}
    generatePoints={() => makeDiagonalZigZag(5, 8)}
    ttsIntro="Climb the zig-zag path up the mountain!"
    ttsComplete="Peak path complete!"
    ttsRetry="Follow the trail to the summit!"
    congratsMessage="Mountain Climber!"
    logType="mountainClimb"
    skillTags={['direction-change', 'motor-planning', 'zig-zag-tracking', 'diagonal-movement']}
  />
);

export default MountainClimbGame;
