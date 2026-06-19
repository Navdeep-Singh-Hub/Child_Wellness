/** OT Level 4 · Session 1 · Game 2 — Feed the Monster · Theme: "Monster Munch" */
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/HorizontalDragGame';
import { MONSTER_FEED_THEME as M } from '@/components/game/occupational/level4/session1/session1Theme';
import React from 'react';

const FeedTheMonsterGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame
    {...props}
    mode="feedMonster"
    theme={{
      title: M.title,
      subtitle: M.subtitle,
      emoji: M.emoji,
      gradient: M.gradient,
      accent: M.accent,
      accentDark: M.accentDark,
      draggableEmoji: M.draggableEmoji,
      targetEmoji: M.targetEmoji,
      backText: '#FDF4FF',
      backBorder: 'rgba(244,114,182,0.35)',
      titleColor: '#FAF5FF',
      subtitleColor: 'rgba(233,213,255,0.9)',
      statLabel: 'rgba(233,213,255,0.75)',
      statValue: '#FFFFFF',
      statBorder: 'rgba(244,114,182,0.3)',
      playBorder: M.playBorder,
      playBg: M.playBg,
      sparkleColor: M.sparkleColor,
      zoneBorder: M.zoneBorder,
    }}
    ttsIntro={M.voiceIntro}
    ttsComplete={M.voiceComplete}
    ttsDrag={M.voiceDrag}
    ttsMiss={M.voiceMiss}
    ttsGoal={M.voiceYum}
    congratsMessage={M.congrats}
    logType="feed-monster"
    skillTags={['direction-control', 'arm-coordination', 'drag-left-right']}
  />
);

export default FeedTheMonsterGame;
