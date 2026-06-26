import { TherapyStageCard } from '@/components/therapyProgress/TherapyStageCard';
import { SESSION_STAGGER_MS, SPRING_CONFIG } from '@/constants/therapyProgressAnimations';
import { getSessionTheme } from '@/constants/stageThemes';
import { UNLOCK_ALL_THERAPY_CONTENT } from '@/constants/unlockConfig';
import type { TherapyProgress } from '@/utils/api';
import { useRouter } from 'expo-router';
import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

type Props = {
  sess: { sessionNumber: number; completed: boolean };
  index: number;
  level: NonNullable<TherapyProgress['levels']>[number];
  therapyId: string;
  isFreeAccess?: boolean;
};

export function TherapySessionCard({ sess, index, level, therapyId, isFreeAccess }: Props) {
  const router = useRouter();
  const prevInLevel = level.sessions.find((s) => s.sessionNumber === sess.sessionNumber - 1);
  const unlocked =
    UNLOCK_ALL_THERAPY_CONTENT ||
    isFreeAccess === true ||
    sess.sessionNumber === 1 ||
    prevInLevel?.completed === true;
  const theme = getSessionTheme(therapyId, level.levelNumber, sess.sessionNumber);

  const goPlay = () => {
    if (!unlocked) return;
    router.push({
      pathname: '/(tabs)/SessionGames',
      params: {
        therapy: therapyId,
        level: level.levelNumber.toString(),
        session: sess.sessionNumber.toString(),
      },
    });
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * SESSION_STAGGER_MS).springify().damping(SPRING_CONFIG.damping)}>
      <TherapyStageCard
        theme={theme}
        locked={!unlocked}
        completed={sess.completed}
        isCurrent={unlocked && !sess.completed}
        actionLabel="Go"
        meta="5 games inside"
        onPress={goPlay}
        disabled={!unlocked}
      />
    </Animated.View>
  );
}
