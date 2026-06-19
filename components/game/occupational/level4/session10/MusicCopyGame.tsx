/** OT Level 4 · Session 10 · Game 3 — Music Copy · Theme: "Beat Mirror" */
import { RhythmPatternGame } from '@/components/game/occupational/level4/session10/RhythmPatternGame';
import { BEAT_MIRROR_THEME as T } from '@/components/game/occupational/level4/session10/session10Theme';
import React from 'react';

const MusicCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmPatternGame
    {...props}
    mode="musicBeat"
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
    logType="music-copy"
    skillTags={['auditory-motor-sync', 'rhythm', 'beat-synchronization', 'cross-body-coordination']}
  />
);

export default MusicCopyGame;
