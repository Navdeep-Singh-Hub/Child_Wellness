/** OT Level 4 · Session 8 · Game 3 — Sound Side Tap · Theme: "Sound Tap" */
import { SideTapGame } from '@/components/game/occupational/level4/session8/SideTapGame';
import { SOUND_TAP_THEME as T } from '@/components/game/occupational/level4/session8/session8Theme';
import React from 'react';

const SoundSideTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SideTapGame
    {...props}
    mode="sound"
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
    logType="sound-side-tap"
    skillTags={['auditory-processing', 'alternating-sides', 'sound-localization']}
  />
);

export default SoundSideTapGame;
