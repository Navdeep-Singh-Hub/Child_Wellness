/** OT Level 3 · Session 3 · Game 5 — Slow Beat Calm Mode · Theme: "Calm Beats" */
import { DrumTapGame } from '@/components/game/occupational/level3/session3/DrumTapGame';
import React from 'react';

const SlowBeatCalmModeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DrumTapGame
    {...props}
    mode="slowBeat"
    theme={{
      title: 'Calm Beats', subtitle: 'Slow, gentle beats — tap when ready', emoji: '🧘',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      drumBg: '#059669', drumActive: '#047857',
      backText: '#047857', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#065F46', subtitleColor: '#059669', statLabel: '#10B981', statValue: '#065F46',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981', hintText: 'Take your time — tap gently!',
    }}
    ttsIntro="Listen to the slow calm beats and tap gently when you are ready!"
    ttsComplete="Beautiful calm tapping!"
    congratsMessage="Calm Drummer!"
    logType="slow-beat-calm-mode"
    skillTags={['self-regulation', 'controlled-movement', 'timing']}
  />
);

export default SlowBeatCalmModeGame;
