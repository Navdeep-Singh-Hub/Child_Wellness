/** OT Level 4 · Session 5 · Game 2 — Walking Hands · Theme: "Hand Walk" */
import { AlternateTapGame } from '@/components/game/occupational/level4/session5/AlternateTapGame';
import React from 'react';

const WalkingHandsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AlternateTapGame
    {...props}
    mode="walking"
    theme={{
      title: 'Hand Walk', subtitle: 'Walk your hands left and right', emoji: '🚶',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      accent: '#10B981', accentDark: '#047857', leftColor: '#3B82F6', rightColor: '#EF4444',
      leftEmoji: '👈', rightEmoji: '👉', targetStyle: 'circle',
      backText: '#065F46', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#064E3B', subtitleColor: '#059669', statLabel: '#10B981', statValue: '#064E3B',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981',
    }}
    ttsIntro="Walk with your hands! Alternate left and right!"
    ttsComplete="Great hand walking!"
    ttsCue="Move left hand, then right hand!"
    ttsSuccess="Perfect walking!"
    congratsMessage="Hand Walk Pro!"
    logType="walking-hands"
    skillTags={['pre-writing', 'alternating-hands', 'hand-coordination']}
  />
);

export default WalkingHandsGame;
