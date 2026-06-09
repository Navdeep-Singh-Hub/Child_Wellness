/** OT Level 4 · Session 6 · Game 4 — Rhythm Pass · Theme: "Beat Pass" */
import { MidlinePassGame } from '@/components/game/occupational/level4/session6/MidlinePassGame';
import React from 'react';

const RhythmPassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MidlinePassGame
    {...props}
    mode="rhythmPass"
    theme={{
      title: 'Beat Pass', subtitle: 'Pass on the beat — 4 passes per round', emoji: '🎵',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', ballEmoji: '🏀',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#6D28D9', statLabel: '#7C3AED', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6',
    }}
    ttsIntro="Pass the ball on the beat! Four passes each round."
    ttsComplete="Great rhythm passing!"
    ttsCue="Wait for the beat, then pass!"
    ttsSuccess="On beat!"
    congratsMessage="Beat Pass Star!"
    logType="rhythm-pass"
    skillTags={['timing', 'flow', 'rhythm', 'midline-crossing']}
  />
);

export default RhythmPassGame;
