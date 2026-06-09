/** OT Level 4 · Session 7 · Game 1 — Arrow Touch · Theme: "Cross Tap" */
import { CrossBodyArrowGame } from '@/components/game/occupational/level4/session7/CrossBodyArrowGame';
import React from 'react';

const ArrowTouchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <CrossBodyArrowGame
    {...props}
    mode="tap"
    theme={{
      title: 'Cross Tap', subtitle: 'Left arrow → right hand!', emoji: '⬅️',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', leftColor: '#3B82F6', rightColor: '#EF4444',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6',
    }}
    ttsIntro="Left arrow means right hand! Cross your body!"
    ttsComplete="Great cross-body tapping!"
    ttsCue="Use the opposite hand for each arrow!"
    ttsSuccess="Perfect!"
    congratsMessage="Cross Tap Star!"
    logType="arrow-touch"
    skillTags={['brain-crossover', 'cross-body-coordination', 'visual-motor']}
  />
);

export default ArrowTouchGame;
