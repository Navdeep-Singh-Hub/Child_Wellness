/**
 * Shared shell for Session 4 letter games.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export type LetterShellTheme = {
  bg: string;
  labelColor: string;
  titleColor: string;
  textOnDark: string;
  backBg: string;
  backBorder: string;
  dotIdle: string;
  dotActive: string;
  dotDone: string;
};

interface LetterGameShellProps {
  theme: LetterShellTheme;
  gameLabel: string;
  gameTitle: string;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function LetterGameShell({
  theme,
  gameLabel,
  gameTitle,
  currentStep,
  totalSteps,
  onBack,
  headerRight,
  children,
  footer,
}: LetterGameShellProps) {
  const dots = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: theme.backBg, borderColor: theme.backBorder },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={theme.textOnDark} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.gameLabel, { color: theme.labelColor }]}>{gameLabel}</Text>
            <Text style={[styles.gameTitle, { color: theme.titleColor }]}>{gameTitle}</Text>
          </View>
          {headerRight ?? <View style={{ width: 40 }} />}
        </View>

        <View style={styles.dotsRow}>
          {dots.map((n) => (
            <View
              key={n}
              style={[
                styles.dot,
                { backgroundColor: theme.dotIdle },
                n === currentStep && [styles.dotActive, { backgroundColor: theme.dotActive }],
                n < currentStep && { backgroundColor: theme.dotDone },
              ]}
            />
          ))}
        </View>

        <View style={styles.body}>{children}</View>
        {footer}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerCenter: { flex: 1 },
  gameLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  gameTitle: { fontSize: 22, fontWeight: '900' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 22 },
  body: { flex: 1 },
  pressed: { opacity: 0.85 },
});
