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
      gradient: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD'],
      trackStroke: 'rgba(59,130,246,0.35)',
      progressStroke: '#2563EB',
      backText: '#1D4ED8',
      backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1D4ED8',
      subtitleColor: '#2563EB',
      statLabel: '#2563EB',
      statValue: '#1D4ED8',
      statBorder: 'rgba(59,130,246,0.2)',
      playBorder: 'rgba(59,130,246,0.25)',
      playBg: 'rgba(255,255,255,0.35)',
      objColors: ['#60A5FA', '#2563EB'],
      sparkleColor: '#2563EB',
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
