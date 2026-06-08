/** OT Level 3 · Session 1 · Game 2 — Stop Go Drum · Theme: "Stop & Go" */
import { RhythmGame } from '@/components/game/occupational/level3/session1/RhythmGame';
import React from 'react';

const StopGoDrumGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmGame
    {...props}
    mode="stopGo"
    theme={{
      title: 'Stop & Go', subtitle: 'Tap only while the drum is playing!', emoji: '⏸️',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      drumBg: '#7C3AED', drumActive: '#6D28D9', drumText: '#fff',
      loudBtn: '#DC2626', softBtn: '#93C5FD',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#6D28D9', statLabel: '#7C3AED', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6', hintText: 'Freeze when the drum goes silent!',
      choiceBg: 'rgba(255,255,255,0.85)', choiceBorder: 'rgba(139,92,246,0.3)', choiceText: '#4C1D95',
    }}
    ttsIntro="Tap only while the drum is playing. Stop when it's silent!"
    ttsComplete="Great impulse control!"
    ttsWrong="Wait for the drum to play!"
    congratsMessage="Stop & Go Star!"
    logType="stopGoDrum"
    skillTags={['impulse-control', 'rhythm', 'listening']}
  />
);

export default StopGoDrumGame;
