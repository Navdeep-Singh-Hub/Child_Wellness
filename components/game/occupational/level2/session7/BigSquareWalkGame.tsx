/** OT Level 2 · Session 7 · Game 2 — Big Square Walk · Theme: "Square Stroll" */
import { LargeShapeTraceGame } from '@/components/game/occupational/level2/session7/LargeShapeTraceGame';
import React from 'react';

const BigSquareWalkGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <LargeShapeTraceGame
    {...props}
    mode="square"
    theme={{
      title: 'Square Stroll', subtitle: 'Walk around the big square with your whole arm', emoji: '⬜',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      guideStroke: 'rgba(16,185,129,0.45)', progressStroke: '#059669',
      fillColor: 'rgba(16,185,129,0.3)', fillDoneColor: '#10B981',
      objectColor: '#10B981', objectOffColor: '#EF4444',
      backText: '#047857', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#065F46', subtitleColor: '#047857', statLabel: '#059669', statValue: '#065F46',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.3)', playBg: 'rgba(167,243,208,0.5)',
      sparkleColor: '#10B981', hintText: 'Walk each edge — complete the full square!',
      objectEmoji: '🟩',
    }}
    ttsIntro="Walk around the big square with your whole arm!"
    ttsComplete="Square walked!"
    ttsIncomplete="Walk around the whole square!"
    congratsMessage="Square Star!"
    logType="bigSquareWalk"
    skillTags={['whole-arm-movement', 'pre-writing', 'large-shape-tracing']}
  />
);

export default BigSquareWalkGame;
