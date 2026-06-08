/** OT Level 3 · Session 1 · Game 5 — Instrument Choice · Theme: "Sound Match" */
import { RhythmGame } from '@/components/game/occupational/level3/session1/RhythmGame';
import React from 'react';

const InstrumentChoiceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmGame
    {...props}
    mode="instrument"
    theme={{
      title: 'Sound Match', subtitle: 'Listen and pick the right instrument!', emoji: '🎵',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      drumBg: '#059669', drumActive: '#047857', drumText: '#fff',
      loudBtn: '#DC2626', softBtn: '#93C5FD',
      backText: '#047857', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#065F46', subtitleColor: '#059669', statLabel: '#10B981', statValue: '#065F46',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981', hintText: 'Which instrument did you hear?',
      choiceBg: 'rgba(255,255,255,0.9)', choiceBorder: 'rgba(16,185,129,0.35)', choiceText: '#065F46',
    }}
    ttsIntro="Listen to the sound and pick the right instrument!"
    ttsComplete="You matched every sound!"
    ttsWrong="Listen again and try another instrument!"
    congratsMessage="Sound Detective!"
    logType="instrumentChoice"
    skillTags={['auditory-discrimination', 'listening', 'sound-identification']}
  />
);

export default InstrumentChoiceGame;
