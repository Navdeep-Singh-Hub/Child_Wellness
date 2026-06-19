/** OT Level 4 · Session 1 · Game 5 — Timed Drag · Theme: "Quick Drag" · Speed Rush Track */
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/HorizontalDragGame';
import { QUICK_DRAG_THEME as Q } from '@/components/game/occupational/level4/session1/session1Theme';
import React from 'react';

const TimedDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame
    {...props}
    mode="timedDrag"
    theme={{
      title: Q.title,
      subtitle: Q.subtitle,
      emoji: Q.emoji,
      gradient: Q.gradient,
      accent: Q.accent,
      accentDark: Q.accentDark,
      draggableEmoji: Q.draggableEmoji,
      targetEmoji: Q.targetEmoji,
      backText: '#FFEDD5',
      backBorder: 'rgba(249,115,22,0.4)',
      titleColor: '#FFF7ED',
      subtitleColor: 'rgba(254,215,170,0.92)',
      statLabel: 'rgba(254,215,170,0.75)',
      statValue: '#FFFFFF',
      statBorder: 'rgba(249,115,22,0.35)',
      playBorder: Q.playBorder,
      playBg: Q.playBg,
      sparkleColor: Q.sparkleColor,
      zoneBorder: Q.zoneBorder,
    }}
    ttsIntro={Q.voiceIntro}
    ttsComplete={Q.voiceComplete}
    ttsDrag={Q.voiceDrag}
    ttsMiss={Q.voiceMiss}
    ttsTimed={Q.voiceTimed}
    ttsTimedMiss={Q.voiceSlow}
    ttsGoal={Q.voiceFast}
    congratsMessage={Q.congrats}
    logType="timed-drag"
    skillTags={['speed', 'accuracy', 'drag-left-right']}
  />
);

export default TimedDragGame;
