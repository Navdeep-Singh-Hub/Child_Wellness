/** OT Level 5 · Session 1 · Game 3 — Avoid the Bomb · Theme: "Safe Tap" */
import { AvoidBombTapGame } from '@/components/game/occupational/level5/session1/AvoidBombTapGame';
import React from 'react';

const AvoidTheBombGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AvoidBombTapGame
    {...props}
    theme={{
      title: 'Safe Tap', subtitle: 'Tap the target, avoid the bombs', emoji: '💣',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C', targetEmoji: '🎯', targetBg: '#10B981', bombEmoji: '💣', bombBg: '#DC2626',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#DC2626', statLabel: '#EF4444', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981',
    }}
    ttsIntro="Tap the green target and avoid the bombs!"
    ttsComplete="Excellent focus and control!"
    ttsCue="Tap targets, avoid bombs!"
    ttsSuccess="Great focus!"
    ttsBomb="Avoid the bombs!"
    congratsMessage="Safe Tap Star!"
    logType="avoid-the-bomb"
    skillTags={['focus', 'control', 'selective-attention']}
  />
);

export default AvoidTheBombGame;
