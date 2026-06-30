import { TherapyProgressBackground } from '@/components/therapyProgress/TherapyProgressBackground';
import { StageCardPattern } from '@/components/therapyProgress/StageCardPattern';
import { TP_COLORS, TP_TYPE } from '@/constants/therapyProgressDesign';
import { getLevelTheme, getSessionTheme, getTherapyLabel } from '@/constants/stageThemes';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = {
  therapyId: string;
  levelNumber: number;
  sessionNumber: number;
  onBack: () => void;
};

export function SessionGamesMenuHeader({ therapyId, levelNumber, sessionNumber, onBack }: Props) {
  const levelTheme = getLevelTheme(therapyId, levelNumber);
  const sessionTheme = getSessionTheme(therapyId, levelNumber, sessionNumber);
  const therapyLabel = getTherapyLabel(therapyId);

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={sessionTheme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <StageCardPattern pattern={sessionTheme.pattern} accent="#FFFFFF" width={400} height={140} />
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.heroCopy}>
          <Text style={styles.breadcrumb}>{therapyLabel} · {levelTheme.realm} · {sessionTheme.badge}</Text>
          <Text style={styles.title}>{sessionTheme.realm}</Text>
          <Text style={styles.subtitle}>{sessionTheme.tagline} · 5 games to complete</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    minHeight: 140,
    overflow: 'hidden',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    zIndex: 2,
  },
  backText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  heroCopy: { marginTop: 14, zIndex: 1 },
  breadcrumb: { ...TP_TYPE.micro, color: 'rgba(255,255,255,0.72)' },
  title: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.8, marginTop: 4 },
  subtitle: { marginTop: 6, fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
});

export function SessionGamesMenuShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={shellStyles.root}>
      <TherapyProgressBackground />
      {children}
    </View>
  );
}

const shellStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: TP_COLORS.page },
});
