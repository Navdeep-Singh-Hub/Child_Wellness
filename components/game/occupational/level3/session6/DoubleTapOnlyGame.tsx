/** OT Level 3 · Session 6 · Game 3 — Double Only */
import { JumpTapGame } from '@/components/game/occupational/level3/session6/JumpTapGame';
import { GAME_THEMES, POND_CHARACTERS, POND_SHELL } from '@/components/game/occupational/level3/session6/jumpPondTheme';
import React from 'react';

const G = GAME_THEMES.doubleTapOnly;

const DoubleTapOnlyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <JumpTapGame
    {...props}
    mode="doubleTapOnly"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444',
      accentDark: '#B91C1C',
      objectEmoji: POND_CHARACTERS.hopper.emoji,
      backText: '#991B1B',
      backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D',
      subtitleColor: '#DC2626',
      statLabel: '#EF4444',
      statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)',
      playBorder: 'rgba(239,68,68,0.25)',
      playBg: POND_SHELL.playBg,
      sparkleColor: POND_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsSingleIgnored="Single tap ignored! Tap twice!"
    congratsMessage={G.congrats}
    logType="double-tap-only"
    skillTags={['sequencing', 'inhibition', 'bilateral-tapping', 'impulse-control']}
  />
);

export default DoubleTapOnlyGame;
