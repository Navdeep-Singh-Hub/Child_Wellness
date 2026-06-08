/** OT Level 3 · Session 3 · Game 2 — Double Beat Copy · Theme: "Two Beats" */
import { DrumTapGame } from '@/components/game/occupational/level3/session3/DrumTapGame';
import React from 'react';

const DoubleBeatCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DrumTapGame
    {...props}
    mode="doubleBeat"
    theme={{
      title: 'Two Beats', subtitle: 'Hear two beats — tap twice back', emoji: '🥁🥁',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      drumBg: '#2563EB', drumActive: '#1D4ED8',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6', hintText: 'Listen, then tap twice!',
    }}
    ttsIntro="The drum plays twice. Tap the drum two times!"
    ttsComplete="You copied every double beat!"
    congratsMessage="Double Tapper!"
    logType="double-beat-copy"
    skillTags={['rhythm', 'hand-coordination', 'working-memory']}
  />
);

export default DoubleBeatCopyGame;
