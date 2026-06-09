/** OT Level 4 · Session 7 · Game 4 — Arrow Sequence · Theme: "Arrow Chain" */
import { CrossBodySequenceGame } from '@/components/game/occupational/level4/session7/CrossBodySequenceGame';
import React from 'react';

const ArrowSequenceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <CrossBodySequenceGame
    {...props}
    theme={{
      title: 'Arrow Chain', subtitle: 'Watch 3 arrows, then tap in order', emoji: '➡️',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      accent: '#10B981', accentDark: '#047857', leftColor: '#10B981', rightColor: '#EF4444',
      backText: '#065F46', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#064E3B', subtitleColor: '#047857', statLabel: '#059669', statValue: '#064E3B',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981',
    }}
    ttsIntro="Watch the arrow sequence, then tap each with the opposite hand!"
    ttsComplete="Great sequence following!"
    ttsCue="Follow the arrow chain!"
    ttsSuccess="Perfect sequence!"
    congratsMessage="Arrow Chain Star!"
    logType="arrow-sequence"
    skillTags={['memory', 'movement', 'sequence-following', 'cross-body-coordination']}
  />
);

export default ArrowSequenceGame;
