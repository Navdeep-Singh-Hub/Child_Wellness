import { PaintStudioBackdrop } from '@/components/game/occupational/level5/session2/colorDot/ColorDotVisuals';
import { COLOR_DOT_COPY, COLOR_DOT_META, COLOR_DOT_THEME } from '@/components/game/occupational/level5/session2/colorDot/colorDotTheme';
import { Session2HUD, Session2Intro } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import React from 'react';

export function ColorDotIntro({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <Session2Intro
      config={{
        theme: COLOR_DOT_THEME,
        emoji: COLOR_DOT_COPY.emoji,
        title: COLOR_DOT_COPY.title,
        tagline: COLOR_DOT_COPY.tagline,
        body: COLOR_DOT_COPY.body,
        chips: [...COLOR_DOT_COPY.chips],
        startLabel: COLOR_DOT_COPY.startLabel,
        startGradient: COLOR_DOT_META.startGradient,
        backdrop: <PaintStudioBackdrop />,
      }}
      onStart={onStart}
      onBack={onBack}
    />
  );
}

export function ColorDotHUD(props: {
  round: number; totalRounds: number; score: number; hint: string; showHint?: boolean; extra?: React.ReactNode;
}) {
  return (
    <Session2HUD
      theme={COLOR_DOT_THEME}
      gameTitle={COLOR_DOT_META.hudTitle}
      emoji={COLOR_DOT_COPY.emoji}
      scoreLabel={COLOR_DOT_META.scoreLabel}
      {...props}
    />
  );
}
