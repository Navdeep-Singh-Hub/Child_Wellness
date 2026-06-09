/** OT Level 4 · Session 8 · Game 4 — Count & Tap · Theme: "Odd Even Tap" */
import { SideTapGame } from '@/components/game/occupational/level4/session8/SideTapGame';
import React from 'react';

const CountAndTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SideTapGame
    {...props}
    mode="count"
    theme={{
      title: 'Odd Even Tap', subtitle: 'Odd = left, even = right!', emoji: '🔢',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C', leftColor: '#EF4444', rightColor: '#3B82F6',
      leftIcon: '1️⃣', rightIcon: '2️⃣',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#B91C1C', statLabel: '#DC2626', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444',
    }}
    ttsIntro="Odd numbers mean left side, even numbers mean right!"
    ttsComplete="Great number-side linking!"
    ttsCue="Odd left, even right!"
    ttsSuccess="Perfect!"
    ttsMiss="Too slow!"
    congratsMessage="Odd Even Tap Star!"
    logType="count-and-tap"
    skillTags={['cognitive-motor-link', 'number-recognition', 'alternating-sides']}
  />
);

export default CountAndTapGame;
