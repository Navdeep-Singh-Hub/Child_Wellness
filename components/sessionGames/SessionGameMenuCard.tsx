import { TherapyStageCard } from '@/components/therapyProgress/TherapyStageCard';
import { getGameSlotTheme } from '@/constants/stageThemes';
import { GAME_MENU_STAGGER_MS, PRESS_SCALE_AMOUNT, SPRING_CONFIG } from '@/constants/therapyProgressAnimations';
import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

type GameItem = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  color: string;
  available: boolean;
};

type Props = {
  game: GameItem;
  index: number;
  therapyId: string;
  levelNumber: number;
  sessionNumber: number;
  unlocked: boolean;
  onPress: () => void;
};

export function SessionGameMenuCard({
  game,
  index,
  therapyId,
  levelNumber,
  sessionNumber,
  unlocked,
  onPress,
}: Props) {
  const slotTheme = getGameSlotTheme(therapyId, levelNumber, sessionNumber, index);
  const theme = {
    ...slotTheme,
    label: game.title,
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * GAME_MENU_STAGGER_MS).springify().damping(SPRING_CONFIG.damping)}>
      <TherapyStageCard
        theme={theme}
        locked={!unlocked}
        actionLabel="Play"
        emoji={game.emoji}
        meta={game.description}
        onPress={onPress}
        disabled={!unlocked}
      />
    </Animated.View>
  );
}
