/** OT Level 3 · Session 7 · Game 5 — Music Swing · Theme: "Beat Swing" */
import { SwingMotionGame } from '@/components/game/occupational/level3/session7/SwingMotionGame';
import React from 'react';

const MusicSwingGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SwingMotionGame
    {...props}
    mode="musicSwing"
    theme={{
      title: 'Beat Swing', subtitle: 'Listen to beats, then swing on each one', emoji: '🎵',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', objectEmoji: '🎶',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#7C3AED', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6',
    }}
    ttsIntro="Listen to four beats, then swing on each beat!"
    ttsComplete="Rhythm swing champion!"
    ttsMusicPrompt="Now swing with the music!"
    ttsBeatMiss="Swing on the beat!"
    ttsSwipeMore="Swing bigger!"
    congratsMessage="Beat Swing Star!"
    logType="music-swing"
    skillTags={['rhythm-imitation', 'timing', 'swinging-motion']}
  />
);

export default MusicSwingGame;
