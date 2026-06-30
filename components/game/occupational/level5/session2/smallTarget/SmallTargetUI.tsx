import { ArcheryRangeBackdrop } from '@/components/game/occupational/level5/session2/smallTarget/SmallTargetVisuals';
import { SMALL_TARGET_COPY, SMALL_TARGET_META, SMALL_TARGET_THEME } from '@/components/game/occupational/level5/session2/smallTarget/smallTargetTheme';
import { RoundCountdownOverlay, Session2HUD, Session2Intro } from '@/components/game/occupational/level5/session2/shared/Session2UI';

export function ArcheryRangeIntro({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <Session2Intro
      config={{
        theme: SMALL_TARGET_THEME,
        emoji: SMALL_TARGET_COPY.emoji,
        title: SMALL_TARGET_COPY.title,
        tagline: SMALL_TARGET_COPY.tagline,
        body: SMALL_TARGET_COPY.body,
        chips: [...SMALL_TARGET_COPY.chips],
        startLabel: SMALL_TARGET_COPY.startLabel,
        startGradient: SMALL_TARGET_META.startGradient,
        backdrop: <ArcheryRangeBackdrop />,
      }}
      onStart={onStart}
      onBack={onBack}
    />
  );
}

export function ArcheryRangeHUD(props: {
  round: number; totalRounds: number; score: number; hint: string; showHint?: boolean;
}) {
  return (
    <Session2HUD
      theme={SMALL_TARGET_THEME}
      gameTitle={SMALL_TARGET_META.hudTitle}
      emoji={SMALL_TARGET_COPY.emoji}
      scoreLabel={SMALL_TARGET_META.scoreLabel}
      {...props}
    />
  );
}

export const ArcheryRangeCountdown = RoundCountdownOverlay;
