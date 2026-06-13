/** OT Level 3 · Session 10 · Game 5 — Count Still · Zen Animal Academy (Level 3 finale) */
import { PostureGame } from '@/components/game/occupational/level3/session10/PostureGame';
import { GAME_THEMES, ZEN_SHELL } from '@/components/game/occupational/level3/session10/zenAcademyTheme';
import React from 'react';

const G = GAME_THEMES.countHold;

const CountHoldGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureGame
    {...props}
    mode="countHold"
    showLevel3Graduation
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FEFCE8', '#FEF08A', '#FDE047', '#CA8A04'],
      accent: '#CA8A04',
      accentDark: '#A16207',
      confirmBg: '#B45309',
      backText: ZEN_SHELL.backText,
      backBorder: ZEN_SHELL.backBorder,
      titleColor: '#713F12',
      subtitleColor: '#A16207',
      statLabel: ZEN_SHELL.statLabel,
      statValue: ZEN_SHELL.statValue,
      statBorder: ZEN_SHELL.statBorder,
      playBorder: ZEN_SHELL.playBorder,
      playBg: ZEN_SHELL.playBg,
      sparkleColor: '#EAB308',
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete="You Are a Zen Master! Level 3 complete!"
    ttsHold="Hold steady while we count!"
    ttsHoldDone="Perfect focus!"
    congratsMessage={G.congrats}
    logType="count-hold"
    skillTags={['attention', 'endurance', 'balance', 'self-regulation', 'level3-graduation']}
  />
);

export default CountHoldGame;
