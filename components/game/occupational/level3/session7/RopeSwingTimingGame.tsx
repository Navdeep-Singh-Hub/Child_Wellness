/** OT Level 3 · Session 7 · Game 4 — Rope Swing Timing · Theme: "Peak Swipe" */
import { SwingMotionGame } from '@/components/game/occupational/level3/session7/SwingMotionGame';
import React from 'react';

const RopeSwingTimingGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SwingMotionGame
    {...props}
    mode="ropeTiming"
    theme={{
      title: 'Peak Swipe', subtitle: 'Swipe when the rope reaches the peak', emoji: '🪢',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C', objectEmoji: '🧸',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#DC2626', statLabel: '#EF4444', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444',
    }}
    ttsIntro="Watch the rope swing. Swipe when it reaches the peak!"
    ttsComplete="Perfect timing!"
    ttsTimingMiss="Swipe when the rope is at the peak!"
    ttsSwipeMore="Swipe bigger!"
    congratsMessage="Peak Swipe Pro!"
    logType="rope-swing-timing"
    skillTags={['anticipation', 'timing', 'swinging-motion']}
  />
);

export default RopeSwingTimingGame;
