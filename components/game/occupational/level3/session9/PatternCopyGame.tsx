/** OT Level 3 · Session 9 · Game 3 — Move Chain */
import { MirrorPoseGame } from '@/components/game/occupational/level3/session9/MirrorPoseGame';
import { GAME_THEMES, HERO_SHELL } from '@/components/game/occupational/level3/session9/superheroTheme';
import React from 'react';

const G = GAME_THEMES.patternCopy;

const PatternCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorPoseGame
    {...props}
    mode="patternCopy"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#F0FDF4', '#DCFCE7', '#86EFAC', '#16A34A'],
      accent: '#22C55E',
      accentDark: '#15803D',
      confirmBg: '#15803D',
      backText: '#166534',
      backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D',
      subtitleColor: '#15803D',
      statLabel: '#22C55E',
      statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)',
      playBorder: 'rgba(34,197,94,0.25)',
      playBg: HERO_SHELL.playBg,
      sparkleColor: HERO_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsPatternCopy="Repeat the move chain, then tap Done!"
    confirmLabel="✅ Done!"
    congratsMessage={G.congrats}
    logType="pattern-copy"
    skillTags={['working-memory', 'sequencing', 'motor-planning', 'movement-sequencing']}
  />
);

export default PatternCopyGame;
