/** OT Level 3 · Session 2 · Game 5 — Road Trace · Giant vs Tiny Kingdom */
import { ScaleMoveGame } from '@/components/game/occupational/level3/session2/ScaleMoveGame';
import { GAME_THEMES, KINGDOM_CHARACTERS, KINGDOM_SHELL } from '@/components/game/occupational/level3/session2/kingdomTheme';
import React from 'react';

const G = GAME_THEMES.path;

const BigPathTraceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ScaleMoveGame
    {...props}
    mode="path"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#7C3AED'],
      accent: '#8B5CF6',
      accentDark: '#6D28D9',
      bigColor: '#7C3AED',
      smallColor: '#A78BFA',
      backText: '#5B21B6',
      backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95',
      subtitleColor: '#6D28D9',
      statLabel: '#8B5CF6',
      statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)',
      playBorder: 'rgba(139,92,246,0.25)',
      playBg: KINGDOM_SHELL.playBg,
      sparkleColor: KINGDOM_SHELL.sparkleColor,
      hintText: G.hintText,
      creatureEmoji: KINGDOM_CHARACTERS.mimi.emoji,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsBig="Trace the wide road!"
    ttsSmall="Trace the narrow road!"
    congratsMessage={G.congrats}
    logType="bigPathTrace"
    skillTags={['visual-motor-integration', 'fine-motor-precision', 'pencil-readiness', 'spatial-awareness']}
  />
);

export default BigPathTraceGame;
