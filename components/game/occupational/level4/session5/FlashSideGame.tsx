/** OT Level 4 · Session 5 · Game 4 — Flash Side · Theme: "Flash Pick" */
import { AlternateTapGame } from '@/components/game/occupational/level4/session5/AlternateTapGame';
import React from 'react';

const FlashSideGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AlternateTapGame
    {...props}
    mode="flash"
    theme={{
      title: 'Flash Pick', subtitle: 'Tap the side that flashes', emoji: '⚡',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C', leftColor: '#3B82F6', rightColor: '#EF4444',
      leftEmoji: '👈', rightEmoji: '👉', targetStyle: 'panel',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#DC2626', statLabel: '#EF4444', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444',
    }}
    ttsIntro="When a side flashes, tap it with the same hand!"
    ttsComplete="Lightning fast picks!"
    ttsSuccess="Perfect pick!"
    ttsWrong="Wrong side!"
    congratsMessage="Flash Pick Hero!"
    logType="flash-side"
    skillTags={['decision-making', 'reaction-time', 'hand-selection']}
  />
);

export default FlashSideGame;
