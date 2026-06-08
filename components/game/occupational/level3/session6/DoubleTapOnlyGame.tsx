/** OT Level 3 · Session 6 · Game 3 — Double Tap Only · Theme: "Double Only" */
import { JumpTapGame } from '@/components/game/occupational/level3/session6/JumpTapGame';
import React from 'react';

const DoubleTapOnlyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <JumpTapGame
    {...props}
    mode="doubleTapOnly"
    theme={{
      title: 'Double Only', subtitle: 'Single taps are ignored — tap twice!', emoji: '👆',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C', objectEmoji: '🦘',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#DC2626', statLabel: '#EF4444', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444', hintText: 'Double tap only!',
    }}
    ttsIntro="Single tap is ignored! Only double tap makes the character jump!"
    ttsComplete="Amazing double taps!"
    ttsSingleIgnored="Single tap ignored! Tap twice!"
    congratsMessage="Double Tap Pro!"
    logType="double-tap-only"
    skillTags={['sequencing', 'inhibition', 'bilateral-tapping']}
  />
);

export default DoubleTapOnlyGame;
