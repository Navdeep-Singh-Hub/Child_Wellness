/** OT Level 2 · Session 10 · Game 4 — Half Shape Complete · Theme: "Half & Whole" */
import { MirrorGame } from '@/components/game/occupational/level2/session10/MirrorGame';
import React from 'react';

const HalfShapeCompleteGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorGame
    {...props}
    mode="half"
    theme={{
      title: 'Half & Whole', subtitle: 'Draw the missing half on the right', emoji: '✨',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      strokeColor: '#10B981', guideStroke: '#64748B', accentColor: '#10B981',
      objectColor: '#10B981', goalColor: '#22C55E', faceStroke: '#FCD34D',
      backText: '#047857', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#065F46', subtitleColor: '#047857', statLabel: '#059669', statValue: '#065F46',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981', hintText: 'Complete the shape on the right side!',
    }}
    ttsIntro="Draw the missing half of the shape on the right!"
    ttsComplete="Shape complete!"
    ttsIncomplete="Draw the missing half!"
    congratsMessage="Shape Finisher!"
    logType="halfShapeComplete"
    skillTags={['bilateral-coordination', 'spatial-awareness', 'mirror-drawing']}
  />
);

export default HalfShapeCompleteGame;
