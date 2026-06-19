/** OT Level 4 · Session 4 · Game 4 — Light Up Targets · Theme: "Flash Tap" · Reaction Grid */
import { DualTapGame } from '@/components/game/occupational/level4/session4/DualTapGame';
import { FLASH_TAP_THEME as T } from '@/components/game/occupational/level4/session4/session4Theme';
import React from 'react';

const LightUpTargetsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualTapGame
    {...props}
    mode="lights"
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
    ttsTooSlow={T.voiceTooSlow}
    ttsWatch={T.voiceWatch}
    congratsMessage={T.congrats}
    logType="light-up-targets"
    skillTags={['reaction-timing', 'two-hand-tap']}
  />
);

export default LightUpTargetsGame;
