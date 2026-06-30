import { BubbleGardenBackdrop } from '@/components/game/occupational/level5/session2/popBubble/PopBubbleVisuals';
import { POP_BUBBLE_COPY, POP_BUBBLE_META, POP_BUBBLE_THEME } from '@/components/game/occupational/level5/session2/popBubble/popBubbleTheme';
import { RoundCountdownOverlay, Session2HUD, Session2Intro } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import React from 'react';

export function PopBubbleIntro({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <Session2Intro
      config={{
        theme: POP_BUBBLE_THEME,
        emoji: POP_BUBBLE_COPY.emoji,
        title: POP_BUBBLE_COPY.title,
        tagline: POP_BUBBLE_COPY.tagline,
        body: POP_BUBBLE_COPY.body,
        chips: [...POP_BUBBLE_COPY.chips],
        startLabel: POP_BUBBLE_COPY.startLabel,
        startGradient: POP_BUBBLE_META.startGradient,
        backdrop: <BubbleGardenBackdrop />,
      }}
      onStart={onStart}
      onBack={onBack}
    />
  );
}

export function PopBubbleHUD(props: {
  round: number; totalRounds: number; score: number; hint: string; showHint?: boolean;
}) {
  return (
    <Session2HUD
      theme={POP_BUBBLE_THEME}
      gameTitle={POP_BUBBLE_META.hudTitle}
      emoji={POP_BUBBLE_COPY.emoji}
      scoreLabel={POP_BUBBLE_META.scoreLabel}
      {...props}
    />
  );
}

export const PopBubbleCountdown = RoundCountdownOverlay;
