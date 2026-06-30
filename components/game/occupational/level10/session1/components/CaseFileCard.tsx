import type { DetectiveCase } from '@/components/game/occupational/level10/session1/sensoryDetectiveTheme';
import { DETECTIVE_SHELL, SENSORY_DETECTIVE_THEME } from '@/components/game/occupational/level10/session1/sensoryDetectiveTheme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = {
  detectiveCase: DetectiveCase;
  visible: boolean;
};

export const CaseFileCard: React.FC<Props> = ({ detectiveCase, visible }) => {
  const scale = useSharedValue(visible ? 1 : 0.85);
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(visible ? 1 : 0.85);
    opacity.value = withSpring(visible ? 1 : 0);
  }, [opacity, scale, visible]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrap, cardStyle]} pointerEvents="none">
      <View style={styles.card}>
        <Text style={styles.stamp}>CONFIDENTIAL</Text>
        <Text style={styles.caseNum}>CASE #{detectiveCase.caseNumber}</Text>
        <Text style={styles.title}>{detectiveCase.caseTitle}</Text>
        <View style={styles.traitRow}>
          <Text style={styles.traitEmoji}>{detectiveCase.traitEmoji}</Text>
          <Text style={styles.trait}>{detectiveCase.trait}</Text>
        </View>
        <Text style={styles.hint}>Find matching evidence on the board</Text>
      </View>
      <Text style={styles.label}>{SENSORY_DETECTIVE_THEME.briefingLabel}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 16, alignSelf: 'center', alignItems: 'center', zIndex: 10 },
  card: {
    width: 220,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: DETECTIVE_SHELL.paper,
    borderWidth: 2,
    borderColor: 'rgba(66,32,6,0.5)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  stamp: {
    color: '#B91C1C',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 4,
  },
  caseNum: { color: '#422006', fontSize: 10, fontWeight: '800', textAlign: 'center' },
  title: { color: '#1C1917', fontSize: 15, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  traitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 },
  traitEmoji: { fontSize: 28 },
  trait: { color: SENSORY_DETECTIVE_THEME.accentCopper, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  hint: { color: '#78716C', fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  label: {
    marginTop: 8,
    color: DETECTIVE_SHELL.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
