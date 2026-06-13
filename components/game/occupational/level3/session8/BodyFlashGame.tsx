/** OT Level 3 · Session 8 · Game 5 — Quick Part */
import { BodyMapGame } from '@/components/game/occupational/level3/session8/BodyMapGame';
import { GAME_THEMES, ROBO_SHELL } from '@/components/game/occupational/level3/session8/roboBodyTheme';
import React from 'react';

const G = GAME_THEMES.bodyFlash;

const BodyFlashGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyMapGame
    {...props}
    mode="bodyFlash"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444',
      accentDark: '#B91C1C',
      backText: '#991B1B',
      backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D',
      subtitleColor: '#DC2626',
      statLabel: '#EF4444',
      statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)',
      playBorder: 'rgba(239,68,68,0.25)',
      playBg: ROBO_SHELL.playBg,
      sparkleColor: ROBO_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsFlash="Tap the flashing body part quickly!"
    ttsFlashMiss="Tap it while you see it!"
    congratsMessage={G.congrats}
    logType="body-flash"
    skillTags={['reaction-time', 'visual-scanning', 'body-recognition', 'attention']}
  />
);

export default BodyFlashGame;
