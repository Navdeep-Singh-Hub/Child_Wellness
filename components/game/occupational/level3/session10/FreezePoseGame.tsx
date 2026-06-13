/** OT Level 3 · Session 10 · Game 4 — Statue Hold · Zen Animal Academy */
import { PostureGame } from '@/components/game/occupational/level3/session10/PostureGame';
import { GAME_THEMES, ZEN_SHELL } from '@/components/game/occupational/level3/session10/zenAcademyTheme';
import React from 'react';

const G = GAME_THEMES.freezePose;

const FreezePoseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureGame
    {...props}
    mode="freezePose"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#ECFEFF', '#CFFAFE', '#67E8F9', '#0891B2'],
      accent: '#0891B2',
      accentDark: '#0E7490',
      confirmBg: '#0E7490',
      backText: ZEN_SHELL.backText,
      backBorder: ZEN_SHELL.backBorder,
      titleColor: '#164E63',
      subtitleColor: '#0891B2',
      statLabel: ZEN_SHELL.statLabel,
      statValue: ZEN_SHELL.statValue,
      statBorder: ZEN_SHELL.statBorder,
      playBorder: ZEN_SHELL.playBorder,
      playBg: ZEN_SHELL.playBg,
      sparkleColor: '#22D3EE',
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsHold="Hold your pose like a statue!"
    ttsHoldDone="Excellent statue hold!"
    congratsMessage={G.congrats}
    logType="freeze-pose"
    skillTags={['postural-endurance', 'self-control', 'sustained-attention', 'stability']}
  />
);

export default FreezePoseGame;
