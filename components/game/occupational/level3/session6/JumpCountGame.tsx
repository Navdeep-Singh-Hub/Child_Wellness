/** OT Level 3 · Session 6 · Game 2 — Jump Count · Theme: "Two Jump" */
import { JumpTapGame } from '@/components/game/occupational/level3/session6/JumpTapGame';
import React from 'react';

const JumpCountGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <JumpTapGame
    {...props}
    mode="jumpCount"
    theme={{
      title: 'Two Jump', subtitle: 'Jump only when number 2 appears', emoji: '🔢',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', objectEmoji: '🐸',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6', hintText: 'Wait for number 2!',
    }}
    ttsIntro="Watch the number. Jump only when you see 2!"
    ttsComplete="Perfect counting jumps!"
    ttsNumberTwo="Number 2! Now jump!"
    ttsNumberOther="Don't jump!"
    ttsWrongNumber="Only jump on number 2!"
    congratsMessage="Two Jump Star!"
    logType="jump-count"
    skillTags={['inhibition', 'number-recognition', 'motor-control']}
  />
);

export default JumpCountGame;
