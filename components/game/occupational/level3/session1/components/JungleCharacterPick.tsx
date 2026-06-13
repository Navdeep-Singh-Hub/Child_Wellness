import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { JUNGLE_CHARACTERS } from '@/components/game/occupational/level3/session1/jungleTheme';
import type { Instrument } from '@/components/game/occupational/level3/session1/rhythmUtils';

const CHAR_LIST = [JUNGLE_CHARACTERS.benny, JUNGLE_CHARACTERS.bella, JUNGLE_CHARACTERS.charlie];

type Props = { onPick: (inst: Instrument) => void; highlight?: Instrument | null };

const CharacterCard: React.FC<{
  emoji: string;
  name: string;
  role: string;
  color: string;
  onPress: () => void;
}> = ({ emoji, name, role, color, onPress }) => {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.92);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}
    >
      <Animated.View style={[styles.card, { borderColor: color }, anim]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.name, { color }]}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
      </Animated.View>
    </Pressable>
  );
};

export const JungleCharacterPick: React.FC<Props> = ({ onPick }) => (
  <View style={styles.row}>
    {CHAR_LIST.map((c) => (
      <CharacterCard
        key={c.id}
        emoji={c.emoji}
        name={c.name}
        role={c.role}
        color={c.color}
        onPress={() => onPick(c.instrument)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 8 },
  card: {
    width: 100,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
  },
  emoji: { fontSize: 36 },
  name: { fontSize: 13, fontWeight: '900', marginTop: 4 },
  role: { fontSize: 10, fontWeight: '600', color: '#64748B', textAlign: 'center' },
});
