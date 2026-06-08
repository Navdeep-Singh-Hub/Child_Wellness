/** OT Level 3 · Session 3 · Game 1 — Single Beat Tap · Theme: "One Beat" */
import { DrumTapGame } from '@/components/game/occupational/level3/session3/DrumTapGame';
import React from 'react';

const SingleBeatTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DrumTapGame
    {...props}
    mode="singleBeat"
    theme={{
      title: 'One Beat', subtitle: 'One drum beat — tap once!', emoji: '🥁',
      gradient: ['#FFF7ED', '#FFEDD5', '#FDBA74', '#F97316'],
      drumBg: '#EA580C', drumActive: '#C2410C',
      backText: '#9A3412', backBorder: 'rgba(249,115,22,0.25)',
      titleColor: '#7C2D12', subtitleColor: '#C2410C', statLabel: '#EA580C', statValue: '#7C2D12',
      statBorder: 'rgba(249,115,22,0.2)', playBorder: 'rgba(249,115,22,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F97316', hintText: 'Tap once when you hear the beat!',
    }}
    ttsIntro="Listen for one drum beat, then tap the drum once!"
    ttsComplete="Great single beat tapping!"
    congratsMessage="Beat Tapper!"
    logType="single-beat-tap"
    skillTags={['timing', 'cause-effect', 'focus']}
  />
);

export default SingleBeatTapGame;
