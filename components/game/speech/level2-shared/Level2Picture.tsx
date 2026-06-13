import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import {
  getLevel2Image,
  type Level2ImageKey,
} from '@/components/game/speech/level2-shared/speechLevel2Assets';
import { getLevel2Sizes, scaleLevel2ImageSize } from '@/components/game/speech/level2-shared/level2Layout';

export type Level2PictureVariant = 'choice' | 'hero' | 'small' | 'zone' | 'avatar';

type Props = {
  imageKey?: Level2ImageKey;
  emoji?: string;
  /** Explicit base size (auto-scaled on tablet). */
  size?: number;
  /** Preferred size bucket when `size` is omitted. */
  variant?: Level2PictureVariant;
  imageStyle?: StyleProp<ImageStyle>;
  emojiStyle?: StyleProp<TextStyle>;
};

function resolveSize(
  width: number,
  size: number | undefined,
  variant: Level2PictureVariant,
): number {
  const sizes = getLevel2Sizes(width);
  if (size != null) {
    return scaleLevel2ImageSize(size, width);
  }
  switch (variant) {
    case 'hero':
      return sizes.heroImage;
    case 'small':
      return sizes.smallImage;
    case 'zone':
      return sizes.zoneImage;
    case 'avatar':
      return sizes.avatarImage;
    default:
      return sizes.choiceImage;
  }
}

/** Renders a level-2 PNG when available, otherwise falls back to emoji text. */
export function Level2Picture({
  imageKey,
  emoji,
  size,
  variant = 'choice',
  imageStyle,
  emojiStyle,
}: Props) {
  const { width } = useWindowDimensions();
  const resolvedSize = resolveSize(width, size, variant);

  if (imageKey) {
    return (
      <Image
        source={getLevel2Image(imageKey)}
        style={[styles.image, { width: resolvedSize, height: resolvedSize }, imageStyle]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    );
  }
  if (emoji) {
    return <Text style={[{ fontSize: resolvedSize * 0.85 }, emojiStyle]}>{emoji}</Text>;
  }
  return null;
}

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
  },
});
