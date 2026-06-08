/** OT Level 3 · Session 9 · Game 3 — Pattern Copy · Theme: "Move Chain" */
import { MirrorPoseGame } from '@/components/game/occupational/level3/session9/MirrorPoseGame';
import React from 'react';

const PatternCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorPoseGame
    {...props}
    mode="patternCopy"
    theme={{
      title: 'Move Chain', subtitle: 'Watch the movement pattern, then repeat it', emoji: '🔄',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#22C55E'],
      accent: '#22C55E', accentDark: '#15803D', confirmBg: '#16A34A',
      backText: '#166534', backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D', subtitleColor: '#16A34A', statLabel: '#22C55E', statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)', playBorder: 'rgba(34,197,94,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#22C55E',
    }}
    ttsIntro="Watch three moves in a row, then do the same pattern!"
    ttsComplete="Pattern master!"
    ttsPatternCopy="Do the pattern, then tap done!"
    confirmLabel="✓ I did the pattern!"
    congratsMessage="Move Chain Hero!"
    logType="pattern-copy"
    skillTags={['memory', 'motor', 'pattern-recognition']}
  />
);

export default PatternCopyGame;
