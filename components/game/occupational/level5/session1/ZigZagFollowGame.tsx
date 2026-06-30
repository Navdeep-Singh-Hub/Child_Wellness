/** OT Level 5 · Session 1 · Game 5 — Zig-zag Follow · Theme: "Zigzag Run" */
import { MovingTargetTapGame } from '@/components/game/occupational/level5/session1/MovingTargetTapGame';
import React from 'react';

const ZigZagFollowGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MovingTargetTapGame
    {...props}
    mode="zigzag"
    theme={{
      title: 'Zigzag Run', subtitle: 'Tap the object moving in a zigzag path', emoji: '〰️',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', objectEmoji: '🔮', objectBg: '#7C3AED',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#7C3AED', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6',
    }}
    ttsIntro="Follow the zigzag path and tap the moving object!"
    ttsComplete="Great zigzag tracking!"
    ttsCue="Tap along the zigzag!"
    ttsSuccess="Perfect tap!"
    congratsMessage="Zigzag Run Star!"
    logType="zigzag-follow"
    skillTags={['line-tracking', 'visual-tracking', 'reading-prep']}
  />
);

export default ZigZagFollowGame;
