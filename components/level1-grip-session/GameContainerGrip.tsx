import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from './ProgressBar';

interface GameContainerGripProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  mascot?: string;
  mascotHint?: string;
  onBack?: () => void;
  children: React.ReactNode;
}

const GRADIENT_COLORS = ['#A78BFA', '#C4B5FD', '#EDE9FE'] as const;

export function GameContainerGrip({
  title,
  currentStep,
  totalSteps,
  mascot = '✏️',
  mascotHint,
  onBack,
  children,
}: GameContainerGripProps) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={[...GRADIENT_COLORS]} style={styles.gradient}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={26} color="#5B21B6" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : null}
        <View style={styles.header}>
          {mascotHint ? (
            <View style={styles.mascotRow}>
              <Text style={styles.mascot}>{mascot}</Text>
              <Text style={styles.mascotHint}>{mascotHint}</Text>
            </View>
          ) : null}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Step {currentStep} of {totalSteps}
          </Text>
          <ProgressBar current={currentStep} total={totalSteps} color="#5B21B6" backgroundColor="rgba(255,255,255,0.5)" />
        </View>
        <View style={styles.content}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, paddingTop: 8 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
    marginLeft: 8,
  },
  pressed: { opacity: 0.8 },
  backText: { fontSize: 17, fontWeight: '700', color: '#5B21B6' },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  mascotRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  mascot: { fontSize: 36 },
  mascotHint: { fontSize: 15, color: '#5B21B6', fontWeight: '600', flex: 1 },
  title: { fontSize: 22, fontWeight: '800', color: '#5B21B6', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6D28D9', textAlign: 'center', marginTop: 4 },
  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 24 },
});
