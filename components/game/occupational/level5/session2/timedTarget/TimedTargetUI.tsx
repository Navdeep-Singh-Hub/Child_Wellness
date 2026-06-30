import { RaceTrackBackdrop } from '@/components/game/occupational/level5/session2/timedTarget/TimedTargetVisuals';
import { TIMED_TARGET_COPY, TIMED_TARGET_META, TIMED_TARGET_THEME } from '@/components/game/occupational/level5/session2/timedTarget/timedTargetTheme';
import { RoundCountdownOverlay, Session2HUD, Session2Intro } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import React from 'react';

export function BeatTheClockIntro({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <Session2Intro
      config={{
        theme: TIMED_TARGET_THEME,
        emoji: TIMED_TARGET_COPY.emoji,
        title: TIMED_TARGET_COPY.title,
        tagline: TIMED_TARGET_COPY.tagline,
        body: TIMED_TARGET_COPY.body,
        chips: [...TIMED_TARGET_COPY.chips],
        startLabel: TIMED_TARGET_COPY.startLabel,
        startGradient: TIMED_TARGET_META.startGradient,
        backdrop: <RaceTrackBackdrop />,
      }}
      onStart={onStart}
      onBack={onBack}
    />
  );
}

export function BeatTheClockHUD(props: {
  round: number; totalRounds: number; score: number; hint: string; showHint?: boolean; extra?: React.ReactNode;
}) {
  return (
    <Session2HUD
      theme={TIMED_TARGET_THEME}
      gameTitle={TIMED_TARGET_META.hudTitle}
      emoji={TIMED_TARGET_COPY.emoji}
      scoreLabel={TIMED_TARGET_META.scoreLabel}
      {...props}
    />
  );
}

export const BeatTheClockCountdown = RoundCountdownOverlay;
