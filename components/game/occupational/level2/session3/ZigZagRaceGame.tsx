/**
 * OT Level 2 · Session 3 · Game 5 — Zig-Zag Race
 * Theme: "Zig Sprint"
 */
import { PolylineTraceGame } from '@/components/game/occupational/level2/session3/PolylineTraceGame';
import { makeDiagonalZigZag } from '@/components/game/occupational/level2/session3/traceUtils';
import React from 'react';

const ZigZagRaceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PolylineTraceGame
    {...props}
    theme={{
      title: 'Zig Sprint',
      subtitle: 'Race along the zig-zag track to the finish',
      emoji: '🏁',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#F87171'],
      trackStroke: 'rgba(239,68,68,0.35)',
      progressStroke: '#DC2626',
      backText: '#B91C1C',
      backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#B91C1C',
      subtitleColor: '#DC2626',
      statLabel: '#DC2626',
      statValue: '#B91C1C',
      statBorder: 'rgba(239,68,68,0.2)',
      playBorder: 'rgba(239,68,68,0.25)',
      playBg: 'rgba(255,255,255,0.35)',
      objColors: ['#F87171', '#DC2626'],
      sparkleColor: '#DC2626',
    }}
    generatePoints={() => makeDiagonalZigZag(5, 9)}
    ttsIntro="Complete the zig-zag race to the finish!"
    ttsComplete="Zig sprint complete!"
    ttsRetry="Follow the race track to the end!"
    congratsMessage="Sprint Champion!"
    logType="zigZagRace"
    skillTags={['direction-change', 'motor-planning', 'zig-zag-tracking', 'timed-movement']}
  />
);

export default ZigZagRaceGame;
