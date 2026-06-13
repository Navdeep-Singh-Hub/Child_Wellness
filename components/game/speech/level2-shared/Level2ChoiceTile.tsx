import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';
import { useLevel2Layout } from '@/components/game/speech/level2-shared/level2Layout';

type Props = {
  label: string;
  accent: string;
  onPress: () => void;
  emoji?: string;
  imageKey?: Level2ImageKey;
  selected?: boolean;
  dimmed?: boolean;
  small?: boolean;
  wide?: boolean;
  orderNum?: number;
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
  wide,
  orderNum,
  style,
}: Props) {
  const { sizes } = useLevel2Layout();

  const tileStyle = {
    minHeight: small ? sizes.tileMinHeight * 0.72 : sizes.tileMinHeight,
    padding: sizes.tilePadding,
    minWidth: wide
      ? sizes.tileWideMinWidthPct
      : small
        ? sizes.tileSmallMinWidthPct
        : sizes.tileMinWidthPct,
    maxWidth: wide
      ? sizes.tileWideMaxWidthPct
      : small
        ? sizes.tileSmallMaxWidthPct
        : sizes.tileMaxWidthPct,
  };

  return (
    <Pressable
      style={[
        styles.tile,
        tileStyle,
        dimmed && styles.dimmed,
        selected && { backgroundColor: accent, borderColor: accent },
        style,
      ]}
      onPress={onPress}
    >
      {orderNum != null ? (
        <View style={[styles.orderBadge, { backgroundColor: accent }]}>
          <Text style={styles.orderBadgeText}>{orderNum}</Text>
        </View>
      ) : null}
      <Level2Picture
        imageKey={imageKey}
        emoji={emoji}
        variant={small ? 'small' : 'choice'}
      />
      <Text
        style={[
          styles.label,
          { fontSize: sizes.labelFontSize, color: selected ? '#fff' : accent },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    margin: 6,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  dimmed: { opacity: 0.35 },
  label: { fontWeight: '800', marginTop: 8, textAlign: 'center' },
  orderBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  orderBadgeText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});
