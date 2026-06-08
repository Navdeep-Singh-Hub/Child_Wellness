/** OT Level 3 · Session 5 · Game 4 — Mirror Swipe · Theme: "Flip Side" */
import { HorizontalSwipeGame } from '@/components/game/occupational/level3/session5/HorizontalSwipeGame';
import React from 'react';

const MirrorSwipeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalSwipeGame
    {...props}
    mode="mirrorSwipe"
    theme={{
      title: 'Flip Side', subtitle: 'Swipe left — object goes right (mirror mode!)', emoji: '🪞',
      gradient: ['#FDF2F8', '#FCE7F3', '#F9A8D4', '#EC4899'],
      accent: '#EC4899', accentDark: '#BE185D', objectEmoji: '✨',
      backText: '#9D174D', backBorder: 'rgba(236,72,153,0.25)',
      titleColor: '#831843', subtitleColor: '#BE185D', statLabel: '#EC4899', statValue: '#831843',
      statBorder: 'rgba(236,72,153,0.2)', playBorder: 'rgba(236,72,153,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EC4899', hintText: 'Opposite direction!',
    }}
    ttsIntro="Mirror mode! When you swipe left, the object goes right!"
    ttsComplete="Amazing mirror swiping!"
    ttsLeft="Swipe left!"
    ttsRight="Swipe right!"
    ttsMirror="Mirror mode! Swipe any direction — it goes the opposite way!"
    congratsMessage="Mirror Mind!"
    logType="mirror-swipe"
    skillTags={['cognitive-flexibility', 'brain-flexibility', 'lateral-movement']}
  />
);

export default MirrorSwipeGame;
