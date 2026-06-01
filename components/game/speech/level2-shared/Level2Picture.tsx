import React from 'react';
import { Image, StyleSheet, Text, type ImageStyle, type StyleProp, type TextStyle } from 'react-native';
import {
  getLevel2Image,
  type Level2ImageKey,
} from '@/components/game/speech/level2-shared/speechLevel2Assets';

type Props = {
  imageKey?: Level2ImageKey;
  emoji?: string;
  size?: number;
  imageStyle?: StyleProp<ImageStyle>;
  emojiStyle?: StyleProp<TextStyle>;
};

/** Renders a level-2 PNG when available, otherwise falls back to emoji text. */
export function Level2Picture({ imageKey, emoji, size = 56, imageStyle, emojiStyle }: Props) {
  if (imageKey) {
    return (
      <Image
        source={getLevel2Image(imageKey)}
        style={[styles.image, { width: size, height: size }, imageStyle]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    );
  }
  if (emoji) {
    return <Text style={[{ fontSize: size * 0.85 }, emojiStyle]}>{emoji}</Text>;
  }
  return null;
}

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
  },
});
