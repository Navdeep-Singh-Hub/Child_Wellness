/** OT Level 4 · Session 9 · Game 4 — Rope Pull · Theme: "Tug Rope" */
import { DualPullGame } from '@/components/game/occupational/level4/session9/DualPullGame';
import { TUG_ROPE_THEME as T } from '@/components/game/occupational/level4/session9/session9Theme';
import React from 'react';

const RopePullGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualPullGame
    {...props}
    theme={{
      title: T.title,
      subtitle: T.subtitle,
      emoji: T.emoji,
      gradient: T.gradient,
      accent: T.accent,
      accentDark: T.accentDark,
      leftColor: T.leftColor,
      rightColor: T.rightColor,
      backText: T.backText,
      backBorder: T.backBorder,
      titleColor: T.titleColor,
      subtitleColor: T.subtitleColor,
      statLabel: T.statLabel,
      statValue: T.statValue,
      statBorder: T.statBorder,
      playBorder: T.playBorder,
      playBg: T.playBg,
      sparkleColor: T.sparkleColor,
    }}
    ttsIntro={T.voiceIntro}
    ttsComplete={T.voiceComplete}
    ttsCue={T.voiceCue}
    ttsSuccess={T.voiceSuccess}
    congratsMessage={T.congrats}
    logType="rope-pull"
    skillTags={['upper-body-integration', 'simultaneous-pulling', 'bilateral-coordination']}
  />
);

export default RopePullGame;
