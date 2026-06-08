/** OT Level 2 · Session 4 · Game 2 — Ball Roll Path · Theme: "Roll Route" */
import { PathFollowGame } from '@/components/game/occupational/level2/session4/PathFollowGame';
import { makeCurvedRollPath } from '@/components/game/occupational/level2/session4/traceUtils';
import React from 'react';

const BallRollPathGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PathFollowGame
    {...props}
    rotateObject
    theme={{
      title: 'Roll Route', subtitle: 'Roll the ball along the curved path', emoji: '⚽',
      gradient: ['#ECFDF5', '#D1FAE5', '#86EFAC', '#4ADE80'],
      trackStroke: 'rgba(22,163,74,0.35)', progressStroke: '#16A34A',
      backText: '#047857', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#047857', subtitleColor: '#059669', statLabel: '#059669', statValue: '#047857',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      objColors: ['#4ADE80', '#16A34A'], sparkleColor: '#16A34A',
    }}
    generatePoints={makeCurvedRollPath}
    ttsIntro="Roll the ball along the path!"
    ttsComplete="Roll route complete!"
    ttsRetry="Keep the ball on the path!"
    congratsMessage="Roll Master!"
    logType="ballRollPath"
    skillTags={['continuous-tracking', 'controlled-movement', 'ball-guidance']}
  />
);

export default BallRollPathGame;
