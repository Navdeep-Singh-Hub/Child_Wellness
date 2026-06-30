import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StudioCardConfig } from './theme';

interface StudioCardProps {
  studio: StudioCardConfig;
  completed: boolean;
  onPress: () => void;
}

export function StudioCard({ studio, completed, onPress }: StudioCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: studio.border },
        pressed && styles.pressed,
      ]}
      accessibilityLabel={`${studio.title}${completed ? ', completed' : ''}`}
      accessibilityRole="button"
    >
      <View style={[styles.iconWrap, { backgroundColor: studio.accentLight }]}>
        <Text style={styles.icon}>{studio.icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.stepBadge, { color: studio.accent }]}>STUDIO {studio.step}</Text>
        <Text style={styles.title}>{studio.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>{studio.desc}</Text>
      </View>
      {completed ? (
        <View style={[styles.check, { backgroundColor: studio.accent }]}>
          <Ionicons name="checkmark" size={18} color="#FFF" />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={studio.accent} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2.5,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 28 },
  body: { flex: 1 },
  stepBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 3 },
  desc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
