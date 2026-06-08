/** OT Level 4 · Session 5 · Game 1 — Left-Right Tap · Theme: "Switch Tap" */
import { AlternateTapGame } from '@/components/game/occupational/level4/session5/AlternateTapGame';
import React from 'react';

const LeftRightTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AlternateTapGame
    {...props}
    mode="sequence"
    theme={{
      title: 'Switch Tap', subtitle: 'Alternate left then right', emoji: '👆',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', leftColor: '#3B82F6', rightColor: '#EF4444',
      leftEmoji: '👈', rightEmoji: '👉', targetStyle: 'circle',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6',
    }}
    ttsIntro="Tap left, then right, alternating!"
    ttsComplete="Great switching!"
    ttsCue="Tap left, then right, alternating!"
    ttsSuccess="Perfect sequence!"
    congratsMessage="Switch Tap Star!"
    logType="left-right-tap"
    skillTags={['sequencing', 'alternating-hands', 'left-right-coordination']}
  />
);

export default LeftRightTapGame;
