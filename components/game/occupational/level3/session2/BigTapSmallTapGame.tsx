/** OT Level 3 · Session 2 · Game 1 — Big Tap vs Small Tap · Theme: "Size Tap" */
import { ScaleMoveGame } from '@/components/game/occupational/level3/session2/ScaleMoveGame';
import React from 'react';

const BigTapSmallTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ScaleMoveGame
    {...props}
    mode="tap"
    theme={{
      title: 'Size Tap', subtitle: 'Tap the big circle for BIG, tiny for SMALL', emoji: '👆',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', bigColor: '#2563EB', smallColor: '#F59E0B',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6', hintText: 'Wait for the cue, then tap the right size!',
    }}
    ttsIntro="Tap the big circle when you hear BIG, and the small circle when you hear SMALL!"
    ttsComplete="Great size tapping!"
    ttsBig="BIG!"
    ttsSmall="SMALL!"
    congratsMessage="Size Tap Star!"
    logType="bigTapSmallTap"
    skillTags={['motor-planning', 'size-discrimination', 'eye-hand-coordination']}
  />
);

export default BigTapSmallTapGame;
