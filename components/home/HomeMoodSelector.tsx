import { HOME_COLORS, HOME_MOODS, HOME_TYPE, type HomeMoodKey } from '@/constants/homeDesign';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { GlassSurface } from './GlassSurface';

type Props = {
  selected: HomeMoodKey;
  onSelect: (mood: HomeMoodKey) => void;
};

const MOOD_KEYS = Object.keys(HOME_MOODS) as HomeMoodKey[];

export function HomeMoodSelector({ selected, onSelect }: Props) {
  const selectedConfig = HOME_MOODS[selected];

  return (
    <View>
      <GlassSurface style={styles.shell}>
        <View style={styles.row}>
          {MOOD_KEYS.map((mood, index) => (
            <MoodOrb key={mood} mood={mood} selected={selected === mood} index={index} onSelect={onSelect} />
          ))}
        </View>
        <View style={[styles.hintBar, { backgroundColor: `${selectedConfig.color}12` }]}>
          <Text style={[styles.hint, { color: selectedConfig.color }]}>{selectedConfig.hint}</Text>
        </View>
      </GlassSurface>
    </View>
  );
}

function MoodOrb({
  mood,
  selected,
  index,
  onSelect,
}: {
  mood: HomeMoodKey;
  selected: boolean;
  index: number;
  onSelect: (m: HomeMoodKey) => void;
}) {
  const config = HOME_MOODS[mood];
  const enter = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      delay: 60 + index * 60,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  useEffect(() => {
    if (!selected) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, selected]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: enter,
        transform: [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
      }}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onSelect(mood);
        }}
        style={({ pressed }) => [styles.orbPress, pressed && { transform: [{ scale: 0.95 }] }]}
        accessibilityRole="button"
        accessibilityLabel={`Feeling ${config.label}`}
        accessibilityState={{ selected }}
      >
        {selected ? (
          <Animated.View style={[styles.ring, { borderColor: config.color, transform: [{ scale: ringScale }] }]} />
        ) : null}
        {selected ? <LinearGradient colors={config.gradient} style={StyleSheet.absoluteFill} /> : null}
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={[styles.label, selected && { color: config.color, fontWeight: '800' }]}>{config.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: { padding: 16 },
  row: { flexDirection: 'row', gap: 10 },
  orbPress: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: HOME_COLORS.borderSubtle,
    backgroundColor: 'rgba(255,255,255,0.55)',
    overflow: 'hidden',
    minHeight: 108,
    justifyContent: 'center',
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 2,
  },
  emoji: { fontSize: 30, marginBottom: 8 },
  label: { ...HOME_TYPE.caption, color: HOME_COLORS.inkMuted, fontSize: 12 },
  hintBar: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  hint: { ...HOME_TYPE.caption, textAlign: 'center', fontWeight: '700' },
});
