/** OT Level 3 · Session 9 · Game 2 — Flip Hand */
import { MirrorPoseGame } from '@/components/game/occupational/level3/session9/MirrorPoseGame';
import { GAME_THEMES, HERO_SHELL } from '@/components/game/occupational/level3/session9/superheroTheme';
import React from 'react';

const G = GAME_THEMES.handMirror;

const HandMirrorGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorPoseGame
    {...props}
    mode="handMirror"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FAF5FF', '#F3E8FF', '#D8B4FE', '#9333EA'],
      accent: '#A855F7',
      accentDark: '#7E22CE',
      confirmBg: '#7E22CE',
      backText: '#6B21A8',
      backBorder: 'rgba(168,85,247,0.25)',
      titleColor: '#581C87',
      subtitleColor: '#7E22CE',
      statLabel: '#A855F7',
      statValue: '#581C87',
      statBorder: 'rgba(168,85,247,0.2)',
      playBorder: 'rgba(168,85,247,0.25)',
      playBg: HERO_SHELL.playBg,
      sparkleColor: HERO_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsHandMirror="Raise your opposite hand!"
    confirmLabel="✅ Done!"
    congratsMessage={G.congrats}
    logType="hand-mirror"
    skillTags={['laterality-awareness', 'cognitive-flexibility', 'spatial-reasoning', 'bilateral-coordination']}
  />
);

export default HandMirrorGame;
