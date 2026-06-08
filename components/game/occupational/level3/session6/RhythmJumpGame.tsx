/** OT Level 3 · Session 6 · Game 4 — Rhythm Jump · Theme: "Beat Jump" */
import { JumpTapGame } from '@/components/game/occupational/level3/session6/JumpTapGame';
import React from 'react';

const RhythmJumpGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <JumpTapGame
    {...props}
    mode="rhythmJump"
    theme={{
      title: 'Beat Jump', subtitle: 'Listen to tap-tap, then copy the rhythm', emoji: '🎵',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', objectEmoji: '🐸',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#7C3AED', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6', hintText: 'Match the beat!',
    }}
    ttsIntro="Listen to the tap-tap beat, then tap the same rhythm!"
    ttsComplete="Rhythm champion!"
    ttsRhythmPrompt="Now tap in the same tap-tap rhythm!"
    ttsRhythmFail="Try matching the beat!"
    congratsMessage="Beat Jump Hero!"
    logType="rhythm-jump"
    skillTags={['rhythm-imitation', 'timing', 'auditory-motor']}
  />
);

export default RhythmJumpGame;
