/** OT Level 4 · Session 2 · Game 4 — Mirror Drag · Theme: "Cross Reach" · Mirror Studio */
import { ReverseHorizontalDragGame } from '@/components/game/occupational/level4/session2/ReverseHorizontalDragGame';
import { CROSS_REACH_THEME as C } from '@/components/game/occupational/level4/session2/session2Theme';
import React from 'react';

const MirrorDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReverseHorizontalDragGame
    {...props}
    mode="mirrorDrag"
    theme={{
      title: C.title,
      subtitle: C.subtitle,
      emoji: C.emoji,
      gradient: C.gradient,
      accent: C.accent,
      accentDark: C.accentDark,
      draggableEmoji: C.draggableEmoji,
      targetEmoji: C.targetEmoji,
      backText: '#E0F2FE',
      backBorder: 'rgba(56,189,248,0.38)',
      titleColor: '#F0F9FF',
      subtitleColor: 'rgba(186,230,253,0.9)',
      statLabel: 'rgba(186,230,253,0.75)',
      statValue: '#FFFFFF',
      statBorder: 'rgba(56,189,248,0.32)',
      playBorder: C.playBorder,
      playBg: C.playBg,
      sparkleColor: C.sparkleColor,
      zoneBorder: C.zoneBorder,
    }}
    ttsIntro={C.voiceIntro}
    ttsComplete={C.voiceComplete}
    ttsDrag={C.voiceDrag}
    ttsMiss={C.voiceMiss}
    ttsGoal={C.voiceReached}
    congratsMessage={C.congrats}
    logType="mirror-drag"
    skillTags={['brain-hand-sync', 'drag-right-left']}
  />
);

export default MirrorDragGame;
