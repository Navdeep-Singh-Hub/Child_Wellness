import { NeonGridBackdrop } from '@/components/game/occupational/level5/session2/movingTarget/MovingTargetVisuals';
import { MOVING_TARGET_COPY, MOVING_TARGET_META, MOVING_TARGET_THEME } from '@/components/game/occupational/level5/session2/movingTarget/movingTargetTheme';
import { Session2HUD, Session2Intro } from '@/components/game/occupational/level5/session2/shared/Session2UI';

export function NeonArcadeIntro({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <Session2Intro
      config={{
        theme: MOVING_TARGET_THEME,
        emoji: MOVING_TARGET_COPY.emoji,
        title: MOVING_TARGET_COPY.title,
        tagline: MOVING_TARGET_COPY.tagline,
        body: MOVING_TARGET_COPY.body,
        chips: [...MOVING_TARGET_COPY.chips],
        startLabel: MOVING_TARGET_COPY.startLabel,
        startGradient: MOVING_TARGET_META.startGradient,
        backdrop: <NeonGridBackdrop />,
      }}
      onStart={onStart}
      onBack={onBack}
    />
  );
}

export function NeonArcadeHUD(props: {
  round: number; totalRounds: number; score: number; hint: string; showHint?: boolean;
}) {
  return (
    <Session2HUD
      theme={MOVING_TARGET_THEME}
      gameTitle={MOVING_TARGET_META.hudTitle}
      emoji={MOVING_TARGET_COPY.emoji}
      scoreLabel={MOVING_TARGET_META.scoreLabel}
      {...props}
    />
  );
}
