/**
 * OT Level 2 · Session 3 · Game 2 — Lightning Bolt
 * Theme: "Thunder Trace"
 */
import { PolylineTraceGame } from '@/components/game/occupational/level2/session3/PolylineTraceGame';
import { makeDiagonalZigZag } from '@/components/game/occupational/level2/session3/traceUtils';
import React from 'react';

const LightningBoltGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PolylineTraceGame
    {...props}
    theme={{
      title: 'Thunder Trace',
      subtitle: 'Trace the lightning bolt with sharp angles',
      emoji: '⚡',
      sceneId: 'lightning',
      gradient: ['#1E1B4B', '#312E81', '#4C1D95', '#6D28D9'],
      trackStroke: 'rgba(251,191,36,0.15)',
      progressStroke: '#FDE68A',
      pathGradient: ['#FEF08A', '#FBBF24', '#F59E0B'],
      backText: '#FDE68A',
      backBorder: 'rgba(251,191,36,0.35)',
      titleColor: '#FDE68A',
      subtitleColor: 'rgba(253,230,138,0.85)',
      statLabel: 'rgba(253,230,138,0.75)',
      statValue: '#FDE68A',
      statBorder: 'rgba(251,191,36,0.25)',
      playBorder: 'rgba(251,191,36,0.3)',
      playBg: 'rgba(15,23,42,0.55)',
      progressFill: '#FBBF24',
      objColors: ['#FDE68A', '#F59E0B'],
      objGlow: '#FBBF24',
      sparkleColor: '#FDE68A',
      traceHint: 'Strike through!',
    }}
    generatePoints={() => makeDiagonalZigZag(7, 12)}
    ttsIntro="Trace the lightning bolt with sharp angles!"
    ttsComplete="Thunder trace complete!"
    ttsRetry="Follow the bolt to the end!"
    congratsMessage="Lightning Master!"
    logType="lightningBolt"
    skillTags={['direction-change', 'motor-planning', 'sharp-angles', 'zig-zag-tracking']}
  />
);

export default LightningBoltGame;
