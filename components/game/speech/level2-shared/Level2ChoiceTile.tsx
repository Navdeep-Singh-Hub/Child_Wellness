import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';
import { speechLevel2ButtonStyles } from '@/components/game/speech/level2-shared/SpeechLevel2Shell';

const PICTURE_SIZE = speechLevel2ButtonStyles.emoji.fontSize;

type Props = {
  label: string;
  accent: string;
  onPress: () => void;
  emoji?: string;
  imageKey?: Level2ImageKey;
  selected?: boolean;
  dimmed?: boolean;
  small?: boolean;
  style?: object;
};

/** Standard tap tile for Speech Level 2 games — PNG when available, emoji fallback. */
export function Level2ChoiceTile({
  label,
  accent,
  onPress,
  emoji,
  imageKey,
  selected,
  dimmed,
  small,
  style,
}: Props) {
  return (
    <Pressable
      style={[
        styles.tile,
        small && styles.tileSmall,
        dimmed && styles.dimmed,
        selected && { backgroundColor: accent, borderColor: accent },
        style,
      ]}
      onPress={onPress}
    >
      <Level2Picture
        imageKey={imageKey}
        emoji={emoji}
        size={small ? 34 : PICTURE_SIZE}
      />
      <Text style={[styles.label, { color: selected ? '#fff' : accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: '42%',
    maxWidth: '48%',
    margin: 5,
    minHeight: 100,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  tileSmall: { minHeight: 80, minWidth: '28%', maxWidth: '32%' },
  dimmed: { opacity: 0.35 },
  label: { ...speechLevel2ButtonStyles.label, marginTop: 6 },
});
