/**
 * OT Level 2 · Session 3 · Game 3 — Saw Path
 * Theme: "Saw Wave"
 */
import { PolylineTraceGame } from '@/components/game/occupational/level2/session3/PolylineTraceGame';
import { makeSawWave } from '@/components/game/occupational/level2/session3/traceUtils';
import React from 'react';

const SawPathGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PolylineTraceGame
    {...props}
    theme={{
      title: 'Saw Wave',
      subtitle: 'Follow the saw-tooth path with controlled motion',
      emoji: '🪚',
      sceneId: 'saw',
      gradient: ['#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74'],
      trackStroke: 'rgba(234,88,12,0.2)',
      progressStroke: '#FB923C',
      pathGradient: ['#FDBA74', '#EA580C', '#C2410C'],
      backText: '#C2410C',
      backBorder: 'rgba(234,88,12,0.25)',
      titleColor: '#C2410C',
      subtitleColor: '#EA580C',
      statLabel: '#EA580C',
      statValue: '#C2410C',
      statBorder: 'rgba(234,88,12,0.2)',
      playBorder: 'rgba(234,88,12,0.3)',
      playBg: 'rgba(254,215,170,0.45)',
      progressFill: '#EA580C',
      objColors: ['#FDBA74', '#EA580C'],
      objGlow: '#F97316',
      sparkleColor: '#FB923C',
      traceHint: 'Saw along!',
    }}
    generatePoints={() => makeSawWave(6, 20)}
    ttsIntro="Follow the saw path with controlled up-down motion!"
    ttsComplete="Saw wave complete!"
    ttsRetry="Stay on the saw-tooth path!"
    congratsMessage="Saw Pro!"
    logType="sawPath"
    skillTags={['direction-change', 'motor-planning', 'vertical-control', 'zig-zag-tracking']}
  />
);

export default SawPathGame;
