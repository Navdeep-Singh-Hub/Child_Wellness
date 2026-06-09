/** OT Level 4 · Session 10 · Game 3 — Music Copy · Theme: "Beat Mirror" */
import { RhythmPatternGame } from '@/components/game/occupational/level4/session10/RhythmPatternGame';
import React from 'react';

const MusicCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmPatternGame
    {...props}
    mode="musicBeat"
    theme={{
      title: 'Beat Mirror', subtitle: 'Copy hand movements to the beat!', emoji: '🎵',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', leftColor: '#8B5CF6', rightColor: '#EF4444',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#6D28D9', statLabel: '#7C3AED', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6',
    }}
    ttsIntro="Listen to the beat pattern, then mirror the hand movements!"
    ttsComplete="Great beat mirroring!"
    ttsListen="Listen to the beat pattern!"
    ttsCopy="Now copy with the beat!"
    ttsSuccess="Perfect!"
    ttsFail="Try again!"
    congratsMessage="Beat Mirror Star!"
    logType="music-copy"
    skillTags={['auditory-motor-sync', 'rhythm', 'beat-synchronization', 'cross-body-coordination']}
  />
);

export default MusicCopyGame;
