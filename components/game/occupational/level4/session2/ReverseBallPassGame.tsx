/** OT Level 4 · Session 2 · Game 1 — Reverse Ball Pass · Theme: "Return Pass" · Sunset Stadium */
import { ReverseHorizontalDragGame } from '@/components/game/occupational/level4/session2/ReverseHorizontalDragGame';
import { RETURN_PASS_THEME as R } from '@/components/game/occupational/level4/session2/session2Theme';
import React from 'react';

const ReverseBallPassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReverseHorizontalDragGame
    {...props}
    mode="ballTransfer"
    theme={{
      title: R.title,
      subtitle: R.subtitle,
      emoji: R.emoji,
      gradient: R.gradient,
      accent: R.accent,
      accentDark: R.accentDark,
      draggableEmoji: R.draggableEmoji,
      targetEmoji: R.targetEmoji,
      backText: '#FFEDD5',
      backBorder: 'rgba(253,224,71,0.35)',
      titleColor: '#FFF7ED',
      subtitleColor: 'rgba(254,215,170,0.92)',
      statLabel: 'rgba(254,215,170,0.75)',
      statValue: '#FFFFFF',
      statBorder: 'rgba(253,224,71,0.3)',
      playBorder: R.playBorder,
      playBg: R.playBg,
      sparkleColor: R.sparkleColor,
      zoneBorder: R.zoneBorder,
    }}
    ttsIntro={R.voiceIntro}
    ttsComplete={R.voiceComplete}
    ttsDrag={R.voiceDrag}
    ttsMiss={R.voiceMiss}
    ttsGoal={R.voiceScore}
    congratsMessage={R.congrats}
    logType="reverse-ball-pass"
    skillTags={['bilateral-balance', 'drag-right-left']}
  />
);

export default ReverseBallPassGame;
