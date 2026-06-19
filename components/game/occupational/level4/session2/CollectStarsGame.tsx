/** OT Level 4 · Session 2 · Game 2 — Collect Stars · Theme: "Star Sweep" · Cosmic Galaxy */
import { ReverseHorizontalDragGame } from '@/components/game/occupational/level4/session2/ReverseHorizontalDragGame';
import { STAR_SWEEP_THEME as S } from '@/components/game/occupational/level4/session2/session2Theme';
import React from 'react';

const CollectStarsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReverseHorizontalDragGame
    {...props}
    mode="collectStars"
    theme={{
      title: S.title,
      subtitle: S.subtitle,
      emoji: S.emoji,
      gradient: S.gradient,
      accent: S.accent,
      accentDark: S.accentDark,
      draggableEmoji: S.draggableEmoji,
      targetEmoji: S.targetEmoji,
      backText: '#EDE9FE',
      backBorder: 'rgba(196,181,253,0.38)',
      titleColor: '#F5F3FF',
      subtitleColor: 'rgba(221,214,254,0.9)',
      statLabel: 'rgba(221,214,254,0.75)',
      statValue: '#FFFFFF',
      statBorder: 'rgba(196,181,253,0.32)',
      playBorder: S.playBorder,
      playBg: S.playBg,
      sparkleColor: S.sparkleColor,
      zoneBorder: S.zoneBorder,
    }}
    ttsIntro={S.voiceIntro}
    ttsComplete={S.voiceComplete}
    ttsDrag={S.voiceDrag}
    ttsMiss={S.voiceMiss}
    ttsGoal={S.voiceCaught}
    congratsMessage={S.congrats}
    logType="collect-stars"
    skillTags={['cross-body-reach', 'drag-right-left']}
  />
);

export default CollectStarsGame;
