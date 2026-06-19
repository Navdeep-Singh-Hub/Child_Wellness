/** OT Level 4 · Session 7 · Game 2 — Arrow Swipe · Theme: "Swipe Cross" */
import { CrossBodySwipeGame } from '@/components/game/occupational/level4/session7/CrossBodySwipeGame';
import { SWIPE_CROSS_THEME as T } from '@/components/game/occupational/level4/session7/session7Theme';
import React from 'react';

const ArrowSwipeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <CrossBodySwipeGame
    {...props}
    theme={{
      title: T.title,
      subtitle: T.subtitle,
      emoji: T.emoji,
      gradient: T.gradient,
      accent: T.accent,
      accentDark: T.accentDark,
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
    logType="arrow-swipe"
    skillTags={['cross-body-coordination', 'direction-control', 'visual-motor']}
  />
);

export default ArrowSwipeGame;
