/** OT Level 4 · Session 10 · Game 2 — Tap-Shoulder Pattern · Theme: "Shoulder Tap" */
import { RhythmPatternGame } from '@/components/game/occupational/level4/session10/RhythmPatternGame';
import React from 'react';

const TapShoulderPatternGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmPatternGame
    {...props}
    mode="shoulderCross"
    theme={{
      title: 'Shoulder Tap', subtitle: 'Cross-body shoulder tap patterns!', emoji: '👆',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      accent: '#10B981', accentDark: '#047857', leftColor: '#10B981', rightColor: '#3B82F6',
      backText: '#065F46', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#064E3B', subtitleColor: '#047857', statLabel: '#059669', statValue: '#064E3B',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981',
    }}
    ttsIntro="Watch cross-body shoulder taps, then copy the pattern!"
    ttsComplete="Great shoulder tapping!"
    ttsListen="Watch the pattern!"
    ttsCopy="Now copy the pattern!"
    ttsSuccess="Perfect!"
    ttsFail="Try again!"
    congratsMessage="Shoulder Tap Star!"
    logType="tap-shoulder-pattern"
    skillTags={['body-mapping', 'cross-body-coordination', 'pattern-copying']}
  />
);

export default TapShoulderPatternGame;
