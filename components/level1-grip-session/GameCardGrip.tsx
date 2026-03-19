import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface GameCardGripProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  isLocked?: boolean;
}

export function GameCardGrip({ icon, title, description, onPress, isLocked }: GameCardGripProps) {
  return (
    <Pressable
      onPress={isLocked ? undefined : onPress}
      style={({ pressed }) => [
        styles.card,
        isLocked && styles.cardLocked,
        pressed && !isLocked && styles.pressed,
      ]}
      accessibilityLabel={title}
      accessibilityRole="button"
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textWrap}>
        <Text style={[styles.title, isLocked && styles.textLocked]}>{title}</Text>
        <Text style={[styles.desc, isLocked && styles.textLocked]} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#A78BFA',
    gap: 16,
  },
  cardLocked: { opacity: 0.7, borderColor: '#C4B5FD' },
  pressed: { opacity: 0.9 },
  icon: { fontSize: 42 },
  textWrap: { flex: 1 },
  title: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  desc: { fontSize: 14, color: '#6B7280' },
  textLocked: { color: '#9CA3AF' },
});
