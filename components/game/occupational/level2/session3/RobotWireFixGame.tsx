/**
 * OT Level 2 · Session 3 · Game 4 — Robot Wire Fix
 * Theme: "Wire Fix Lab"
 */
import { PolylineTraceGame } from '@/components/game/occupational/level2/session3/PolylineTraceGame';
import { makeDiagonalZigZag } from '@/components/game/occupational/level2/session3/traceUtils';
import React from 'react';

const RobotWireFixGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PolylineTraceGame
    {...props}
    theme={{
      title: 'Wire Fix Lab',
      subtitle: 'Follow the zig-zag wire to fix the robot',
      emoji: '🤖',
      sceneId: 'robot',
      gradient: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD'],
      trackStroke: 'rgba(59,130,246,0.2)',
      progressStroke: '#60A5FA',
      pathGradient: ['#93C5FD', '#3B82F6', '#1D4ED8'],
      backText: '#1D4ED8',
      backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1D4ED8',
      subtitleColor: '#2563EB',
      statLabel: '#2563EB',
      statValue: '#1D4ED8',
      statBorder: 'rgba(59,130,246,0.2)',
      playBorder: 'rgba(59,130,246,0.3)',
      playBg: 'rgba(191,219,254,0.45)',
      progressFill: '#2563EB',
      objColors: ['#93C5FD', '#2563EB'],
      objGlow: '#3B82F6',
      sparkleColor: '#60A5FA',
      traceHint: 'Fix the wire!',
    }}
    generatePoints={() => makeDiagonalZigZag(6, 10)}
    ttsIntro="Follow the zig-zag wire to fix the robot!"
    ttsComplete="Wire fix complete!"
    ttsRetry="Trace the wire to the end!"
    congratsMessage="Robot Engineer!"
    logType="robotWireFix"
    skillTags={['direction-change', 'motor-planning', 'zig-zag-tracking', 'precision-tracing']}
  />
);

export default RobotWireFixGame;
