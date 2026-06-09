/** OT Level 4 · Session 8 · Game 3 — Sound Side Tap · Theme: "Sound Tap" */
import { SideTapGame } from '@/components/game/occupational/level4/session8/SideTapGame';
import React from 'react';

const SoundSideTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SideTapGame
    {...props}
    mode="sound"
    theme={{
      title: 'Sound Tap', subtitle: 'Hear the sound — tap that side!', emoji: '🔊',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', leftColor: '#8B5CF6', rightColor: '#EF4444',
      leftIcon: '🔊', rightIcon: '🔊',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#6D28D9', statLabel: '#7C3AED', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6',
    }}
    ttsIntro="Listen for the sound and tap the side it plays on!"
    ttsComplete="Great sound localization!"
    ttsCue="Tap the side where you hear the sound!"
    ttsSuccess="Perfect!"
    ttsMiss="Too slow!"
    congratsMessage="Sound Tap Star!"
    logType="sound-side-tap"
    skillTags={['auditory-processing', 'alternating-sides', 'sound-localization']}
  />
);

export default SoundSideTapGame;
