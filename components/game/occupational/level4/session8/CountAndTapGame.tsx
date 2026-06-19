/** OT Level 4 · Session 8 · Game 4 — Count & Tap · Theme: "Odd Even Tap" */
import { SideTapGame } from '@/components/game/occupational/level4/session8/SideTapGame';
import { ODD_EVEN_TAP_THEME as T } from '@/components/game/occupational/level4/session8/session8Theme';
import React from 'react';

const CountAndTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SideTapGame
    {...props}
    mode="count"
    theme={{
      title: T.title,
      subtitle: T.subtitle,
      emoji: T.emoji,
      gradient: T.gradient,
      accent: T.accent,
      accentDark: T.accentDark,
      leftColor: T.leftColor,
      rightColor: T.rightColor,
      leftIcon: T.leftIcon,
      rightIcon: T.rightIcon,
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
    ttsMiss={T.voiceMiss}
    ttsWrong={T.voiceWrong}
    congratsMessage={T.congrats}
    logType="count-and-tap"
    skillTags={['cognitive-motor-link', 'number-recognition', 'alternating-sides']}
  />
);

export default CountAndTapGame;
