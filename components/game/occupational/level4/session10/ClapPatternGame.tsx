/** OT Level 4 · Session 10 · Game 1 — Clap Pattern · Theme: "Cross Clap" */
import { RhythmPatternGame } from '@/components/game/occupational/level4/session10/RhythmPatternGame';
import { CROSS_CLAP_THEME as T } from '@/components/game/occupational/level4/session10/session10Theme';
import React from 'react';

const ClapPatternGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmPatternGame
    {...props}
    mode="clapCross"
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
    ttsListen={T.voiceListen}
    ttsCopy={T.voiceCopy}
    ttsSuccess={T.voiceSuccess}
    ttsFail={T.voiceFail}
    congratsMessage={T.congrats}
    logType="clap-pattern"
    skillTags={['rhythm', 'midline', 'cross-body-coordination', 'pattern-copying']}
  />
);

export default ClapPatternGame;
