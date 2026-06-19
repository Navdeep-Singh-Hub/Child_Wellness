/** OT Level 4 · Session 4 · Game 1 — Double Circle Tap · Theme: "Twin Tap" · Sync Arena */
import { DualTapGame } from '@/components/game/occupational/level4/session4/DualTapGame';
import { TWIN_TAP_THEME as T } from '@/components/game/occupational/level4/session4/session4Theme';
import React from 'react';

const DoubleCircleTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualTapGame
    {...props}
    mode="circles"
    theme={{
      title: T.title,
      subtitle: T.subtitle,
      emoji: T.emoji,
      gradient: T.gradient,
      accent: T.accent,
      accentDark: T.accentDark,
      leftColor: T.leftColor,
      rightColor: T.rightColor,
      leftEmoji: T.leftEmoji,
      rightEmoji: T.rightEmoji,
      targetStyle: 'circle',
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
    congratsMessage={T.congrats}
    logType="double-circle-tap"
    skillTags={['bilateral-coordination', 'two-hand-tap']}
  />
);

export default DoubleCircleTapGame;
