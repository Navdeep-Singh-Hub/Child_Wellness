/** OT Level 4 · Session 7 · Game 5 — Speed Arrows · Theme: "Flash Cross" */
import { CrossBodyArrowGame } from '@/components/game/occupational/level4/session7/CrossBodyArrowGame';
import { FLASH_CROSS_THEME as T } from '@/components/game/occupational/level4/session7/session7Theme';
import React from 'react';

const SpeedArrowsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <CrossBodyArrowGame
    {...props}
    mode="speed"
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
    ttsTooSlow={T.voiceTooSlow}
    congratsMessage={T.congrats}
    logType="speed-arrows"
    skillTags={['reaction-speed', 'cross-body-coordination', 'visual-motor']}
  />
);

export default SpeedArrowsGame;
