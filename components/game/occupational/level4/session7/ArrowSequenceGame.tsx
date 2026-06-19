/** OT Level 4 · Session 7 · Game 4 — Arrow Sequence · Theme: "Arrow Chain" */
import { CrossBodySequenceGame } from '@/components/game/occupational/level4/session7/CrossBodySequenceGame';
import { ARROW_CHAIN_THEME as T } from '@/components/game/occupational/level4/session7/session7Theme';
import React from 'react';

const ArrowSequenceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <CrossBodySequenceGame
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
    ttsWrong={T.voiceWrong}
    congratsMessage={T.congrats}
    logType="arrow-sequence"
    skillTags={['memory', 'movement', 'sequence-following', 'cross-body-coordination']}
  />
);

export default ArrowSequenceGame;
