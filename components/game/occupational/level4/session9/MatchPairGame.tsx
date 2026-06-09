/** OT Level 4 · Session 9 · Game 2 — Match Pair · Theme: "Pair Match" */
import { DualDragGame } from '@/components/game/occupational/level4/session9/DualDragGame';
import React from 'react';

const MatchPairGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualDragGame
    {...props}
    mode="matchCenter"
    theme={{
      title: 'Pair Match', subtitle: 'Drag matching shapes to the center!', emoji: '🤝',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      accent: '#10B981', accentDark: '#047857', leftColor: '#10B981', rightColor: '#059669',
      backText: '#065F46', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#064E3B', subtitleColor: '#047857', statLabel: '#059669', statValue: '#064E3B',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981', zoneBorder: 'rgba(16,185,129,0.45)',
    }}
    ttsIntro="Drag both matching shapes to the center together!"
    ttsComplete="Great pair matching!"
    ttsCue="Drag both shapes to the center!"
    ttsSuccess="Perfect match!"
    congratsMessage="Pair Match Star!"
    logType="match-pair"
    skillTags={['coordination', 'simultaneous-dragging', 'matching']}
  />
);

export default MatchPairGame;
