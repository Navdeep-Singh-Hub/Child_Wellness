/** OT Level 5 · Session 1 · Game 2 — Follow the Butterfly · Theme: "Butterfly Trail" */
import { FollowTrackGame } from '@/components/game/occupational/level5/session1/FollowTrackGame';
import React from 'react';

const FollowTheButterflyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <FollowTrackGame
    {...props}
    theme={{
      title: 'Butterfly Trail', subtitle: 'Follow the butterfly with your finger', emoji: '🦋',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      accent: '#10B981', accentDark: '#047857', targetEmoji: '🦋', targetBg: '#059669', fingerColor: '#34D399',
      backText: '#065F46', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#064E3B', subtitleColor: '#059669', statLabel: '#10B981', statValue: '#064E3B',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981',
    }}
    ttsIntro="Follow the butterfly with your finger. Stay close for three seconds!"
    ttsComplete="Beautiful butterfly following!"
    ttsCue="Follow the butterfly!"
    ttsSuccess="Great following!"
    congratsMessage="Butterfly Trail Star!"
    logType="follow-the-butterfly"
    skillTags={['smooth-pursuit', 'visual-tracking', 'eye-hand-coordination']}
  />
);

export default FollowTheButterflyGame;
