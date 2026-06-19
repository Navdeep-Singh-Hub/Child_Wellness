/** OT Level 4 · Session 10 · Game 4 — Memory Rhythm · Theme: "Rhythm Recall" */
import { RhythmPatternGame } from '@/components/game/occupational/level4/session10/RhythmPatternGame';
import { RHYTHM_RECALL_THEME as T } from '@/components/game/occupational/level4/session10/session10Theme';
import React from 'react';

const MemoryRhythmGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmPatternGame
    {...props}
    mode="memory"
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
    logType="memory-rhythm"
    skillTags={['working-memory', 'pattern-memory', 'rhythm', 'cross-body-coordination']}
  />
);

export default MemoryRhythmGame;
