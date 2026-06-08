/** OT Level 3 · Session 3 · Game 10 — Music Speed Control · Theme: "Move to Music" */
import { SpeedGame } from '@/components/game/occupational/level3/session3/SpeedGame';
import React from 'react';

const MusicSpeedControlGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SpeedGame
    {...props}
    mode="musicSpeed"
    theme={{
      title: 'Move to Music', subtitle: 'Fast music = fast swipe, slow music = slow swipe', emoji: '🎵',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', characterEmoji: '🎵',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#7C3AED', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6', hintText: 'Move with the music tempo!',
      fastColor: '#F59E0B', slowColor: '#6366F1',
    }}
    ttsIntro="When music is fast, move fast! When music is slow, move slow!"
    ttsComplete="Great music movement!"
    ttsFast="Fast music! Move fast!"
    ttsSlow="Slow music! Move slow!"
    ttsTooFast="That swipe was too fast for slow music!"
    ttsTooSlow="That swipe was too slow for fast music!"
    congratsMessage="Music Mover!"
    logType="music-speed-control"
    skillTags={['auditory-motor-integration', 'speed-control', 'rhythm']}
  />
);

export default MusicSpeedControlGame;
