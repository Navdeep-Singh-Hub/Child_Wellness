/** OT Level 4 · Session 7 · Game 2 — Arrow Swipe · Theme: "Swipe Cross" */
import { CrossBodySwipeGame } from '@/components/game/occupational/level4/session7/CrossBodySwipeGame';
import React from 'react';

const ArrowSwipeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <CrossBodySwipeGame
    {...props}
    theme={{
      title: 'Swipe Cross', subtitle: 'Swipe across your body!', emoji: '➡️',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#B91C1C', statLabel: '#DC2626', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444',
    }}
    ttsIntro="Swipe across your body in the direction shown!"
    ttsComplete="Great cross-body swiping!"
    ttsCue="Swipe the opposite direction!"
    ttsSuccess="Perfect swipe!"
    ttsMiss="Swipe the opposite direction!"
    congratsMessage="Swipe Cross Star!"
    logType="arrow-swipe"
    skillTags={['cross-body-coordination', 'direction-control', 'visual-motor']}
  />
);

export default ArrowSwipeGame;
