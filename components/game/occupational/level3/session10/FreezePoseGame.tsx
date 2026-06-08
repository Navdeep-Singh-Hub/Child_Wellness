/** OT Level 3 · Session 10 · Game 4 — Freeze Pose · Theme: "Statue Hold" */
import { PostureGame } from '@/components/game/occupational/level3/session10/PostureGame';
import React from 'react';

const FreezePoseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureGame
    {...props}
    mode="freezePose"
    theme={{
      title: 'Statue Hold', subtitle: 'Hold each pose until the bar fills', emoji: '🧊',
      gradient: ['#F0F9FF', '#E0F2FE', '#7DD3FC', '#0EA5E9'],
      accent: '#0EA5E9', accentDark: '#0369A1', confirmBg: '#0284C7',
      backText: '#075985', backBorder: 'rgba(14,165,233,0.25)',
      titleColor: '#0C4A6E', subtitleColor: '#0284C7', statLabel: '#0EA5E9', statValue: '#0C4A6E',
      statBorder: 'rgba(14,165,233,0.2)', playBorder: 'rgba(14,165,233,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#0EA5E9',
    }}
    ttsIntro="Hold each pose steady like a statue until the timer finishes!"
    ttsComplete="Statue hold champion!"
    ttsHold="Hold the pose!"
    ttsHoldDone="Perfect hold!"
    congratsMessage="Statue Hold Star!"
    logType="freeze-pose"
    skillTags={['balance', 'strength', 'posture']}
  />
);

export default FreezePoseGame;
