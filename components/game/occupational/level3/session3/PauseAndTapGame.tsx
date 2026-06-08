/** OT Level 3 · Session 3 · Game 3 — Pause & Tap · Theme: "Wait & Tap" */
import { DrumTapGame } from '@/components/game/occupational/level3/session3/DrumTapGame';
import React from 'react';

const PauseAndTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DrumTapGame
    {...props}
    mode="pauseTap"
    theme={{
      title: 'Wait & Tap', subtitle: 'Beat, pause, then tap!', emoji: '⏸️',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      drumBg: '#7C3AED', drumActive: '#6D28D9',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#6D28D9', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6', hintText: 'Wait for the pause, then tap!',
    }}
    ttsIntro="Listen for the beat, wait through the pause, then tap!"
    ttsComplete="Great waiting and tapping!"
    congratsMessage="Pause Master!"
    logType="pause-and-tap"
    skillTags={['impulse-control', 'listening', 'timing']}
  />
);

export default PauseAndTapGame;
