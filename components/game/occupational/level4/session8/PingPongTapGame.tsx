/** OT Level 4 · Session 8 · Game 2 — Ping-Pong Tap · Theme: "Rally Tap" */
import { SidePingPongGame } from '@/components/game/occupational/level4/session8/SidePingPongGame';
import React from 'react';

const PingPongTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SidePingPongGame
    {...props}
    theme={{
      title: 'Rally Tap', subtitle: 'Tap when the ball hits center!', emoji: '🏓',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      accent: '#10B981', accentDark: '#047857', leftColor: '#10B981', rightColor: '#3B82F6',
      ballEmoji: '🏓',
      backText: '#065F46', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#064E3B', subtitleColor: '#047857', statLabel: '#059669', statValue: '#064E3B',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981',
    }}
    ttsIntro="Watch the ball cross the screen and tap at the center!"
    ttsComplete="Great rally tapping!"
    ttsCue="Tap when the ball reaches the center!"
    ttsSuccess="Great tap!"
    ttsMiss="Wait for the ball at center!"
    congratsMessage="Rally Tap Star!"
    logType="ping-pong-tap"
    skillTags={['focus', 'alternating-sides', 'timing', 'visual-motor']}
  />
);

export default PingPongTapGame;
