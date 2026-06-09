/** OT Level 4 · Session 8 · Game 1 — Side Lights · Theme: "Glow Tap" */
import { SideTapGame } from '@/components/game/occupational/level4/session8/SideTapGame';
import React from 'react';

const SideLightsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SideTapGame
    {...props}
    mode="lights"
    theme={{
      title: 'Glow Tap', subtitle: 'Tap the glowing side!', emoji: '💡',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', leftColor: '#3B82F6', rightColor: '#EF4444',
      leftIcon: '💡', rightIcon: '💡',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6',
    }}
    ttsIntro="Watch which side glows and tap it!"
    ttsComplete="Great bilateral tapping!"
    ttsCue="Tap the glowing side!"
    ttsSuccess="Perfect!"
    ttsMiss="Too slow!"
    congratsMessage="Glow Tap Star!"
    logType="side-lights"
    skillTags={['bilateral-activation', 'alternating-sides', 'visual-motor']}
  />
);

export default SideLightsGame;
