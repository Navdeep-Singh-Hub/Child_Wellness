/**
 * Level 9 (Clockwise) — Session 2: Number Pattern, Spot 5 Differences, Shape Rotation, Bicycle Assembly
 */
import { CLOCKWISE_SESSIONS } from '@/components/level9-session/shared/clockwiseSessionConfigs';
import { ClockwiseSessionFlow } from '@/components/level9-session/shared/ClockwiseSessionFlow';
import React from 'react';
import { NumberPatternLevel9Session2Game } from './NumberPatternLevel9Session2Game';
import { SpotTheDifference5Level9Session2Game } from './SpotTheDifference5Level9Session2Game';
import { ShapeRotationPentagonLevel9Session2Game } from './ShapeRotationPentagonLevel9Session2Game';
import { BicycleAssemblyLevel9Session2Game } from './BicycleAssemblyLevel9Session2Game';
import { Level9NotebookUploadSameShapeDifferentColors } from './Level9NotebookUploadSameShapeDifferentColors';

interface Level9Session2Props {
  onExit?: () => void;
}

export function Level9Session2({ onExit }: Level9Session2Props = {}) {
  const config = CLOCKWISE_SESSIONS[2];

  return (
    <ClockwiseSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <NumberPatternLevel9Session2Game onComplete={advance} />}
          {step === 2 && <SpotTheDifference5Level9Session2Game onComplete={advance} />}
          {step === 3 && <ShapeRotationPentagonLevel9Session2Game onComplete={advance} />}
          {step === 4 && <BicycleAssemblyLevel9Session2Game onComplete={advance} />}
          {step === 5 && <Level9NotebookUploadSameShapeDifferentColors onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
