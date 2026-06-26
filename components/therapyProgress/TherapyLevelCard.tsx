import { TherapyStageCard } from '@/components/therapyProgress/TherapyStageCard';
import { LEVEL_STAGGER_MS, SPRING_CONFIG } from '@/constants/therapyProgressAnimations';
import { getLevelTheme } from '@/constants/stageThemes';
import { UNLOCK_ALL_THERAPY_CONTENT } from '@/constants/unlockConfig';
import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

type Props = {
  levelNumber: number;
  index: number;
  currentLevel: number;
  therapyId: string;
  speechSubtitle: string | null;
  onSelectLevel: (level: number, unlocked: boolean) => void;
};

export function TherapyLevelCard({
  levelNumber,
  index,
  currentLevel,
  therapyId,
  speechSubtitle,
  onSelectLevel,
}: Props) {
  const unlocked = UNLOCK_ALL_THERAPY_CONTENT || levelNumber <= currentLevel;
  const isCurrent = levelNumber === currentLevel;
  const theme = getLevelTheme(therapyId, levelNumber, speechSubtitle);

  return (
    <Animated.View entering={FadeInUp.delay(index * LEVEL_STAGGER_MS).springify().damping(SPRING_CONFIG.damping)}>
      <TherapyStageCard
        theme={theme}
        locked={!unlocked}
        isCurrent={isCurrent}
        actionLabel="Play"
        meta="10 sessions"
        onPress={() => onSelectLevel(levelNumber, unlocked)}
      />
    </Animated.View>
  );
}
