/** OT Level 2 · Session 8 · Game 4 — Careful Trace Challenge · Theme: "Steady Hand" */
import { SmallShapeTraceGame } from '@/components/game/occupational/level2/session8/SmallShapeTraceGame';
import { SESSION8_PACING } from '@/components/game/occupational/level2/session8/session8Pacing';
import React from 'react';

const CarefulTraceChallengeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SmallShapeTraceGame
    {...props}
    mode="circle"
    circleRadius={SESSION8_PACING.carefulCircleRadius}
    tolerance={SESSION8_PACING.carefulTolerance}
    theme={{
      title: 'Steady Hand', subtitle: 'Trace slowly and carefully with precision', emoji: '🎯',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      guideStroke: 'rgba(16,185,129,0.5)', progressStroke: '#059669',
      objectColor: '#10B981', objectOffColor: '#EF4444',
      backText: '#047857', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#065F46', subtitleColor: '#047857', statLabel: '#059669', statValue: '#065F46',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.3)', playBg: 'rgba(167,243,208,0.5)',
      sparkleColor: '#10B981', hintText: 'Go slow — stay close to the line!',
      objectEmoji: '🎯',
    }}
    ttsIntro="Trace slowly and carefully with precision!"
    ttsComplete="Careful trace complete!"
    ttsIncomplete="Trace carefully and slowly!"
    congratsMessage="Steady Star!"
    logType="carefulTraceChallenge"
    skillTags={['finger-control', 'precision', 'slow-careful-tracing']}
  />
);

export default CarefulTraceChallengeGame;
