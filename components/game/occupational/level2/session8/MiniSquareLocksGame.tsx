/** OT Level 2 · Session 8 · Game 2 — Mini Square Locks · Theme: "Lock Loop" */
import { SmallShapeTraceGame } from '@/components/game/occupational/level2/session8/SmallShapeTraceGame';
import { SESSION8_PACING } from '@/components/game/occupational/level2/session8/session8Pacing';
import React from 'react';

const MiniSquareLocksGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SmallShapeTraceGame
    {...props}
    mode="square"
    squareSize={SESSION8_PACING.miniSquareSize}
    theme={{
      title: 'Lock Loop', subtitle: 'Trace the mini square lock with precision', emoji: '🔒',
      gradient: ['#EEF2FF', '#E0E7FF', '#A5B4FC', '#6366F1'],
      guideStroke: 'rgba(99,102,241,0.5)', progressStroke: '#4F46E5',
      objectColor: '#6366F1', objectOffColor: '#EF4444',
      backText: '#4338CA', backBorder: 'rgba(99,102,241,0.25)',
      titleColor: '#3730A3', subtitleColor: '#4338CA', statLabel: '#4F46E5', statValue: '#3730A3',
      statBorder: 'rgba(99,102,241,0.2)', playBorder: 'rgba(99,102,241,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#6366F1', hintText: 'Trace every edge of the mini square!',
      objectEmoji: '🔒',
    }}
    ttsIntro="Trace the mini square lock with precision!"
    ttsComplete="All locks traced!"
    ttsIncomplete="Trace the whole square!"
    congratsMessage="Lock Master!"
    logType="miniSquareLocks"
    skillTags={['finger-control', 'precision', 'small-shape-tracing']}
  />
);

export default MiniSquareLocksGame;
