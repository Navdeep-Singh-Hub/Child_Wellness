/** Shared layout shell for OT L5 Session 10 integrated visual games */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { Session2HUD, Session2Intro } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { GauntletBackdrop } from '@/components/game/occupational/level5/session10/VisualGauntletVisuals';
import type { GauntletCopy } from '@/components/game/occupational/level5/session10/visualGauntletThemes';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ShellProps = {
  theme: Session2ThemeTokens;
  copy: GauntletCopy;
  showInfo: boolean;
  done: boolean;
  finalStats: { correct: number; total: number; xp: number } | null;
  round: number;
  totalRounds: number;
  score: number;
  hint?: string;
  showHint?: boolean;
  onStart: () => void;
  onExit: () => void;
  onContinue?: () => void;
  onBack?: () => void;
  children: React.ReactNode;
};

export function GauntletShell({
  theme, copy, showInfo, done, finalStats, round, totalRounds, score, hint, showHint,
  onStart, onExit, onContinue, onBack, children,
}: ShellProps) {
  if (showInfo) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: copy.rootBg }]} edges={['top', 'bottom']}>
        <Session2Intro
          config={{
            theme, emoji: copy.emoji, title: copy.gameTitle, tagline: copy.tagline, body: copy.introBody,
            chips: copy.chips, startLabel: copy.startLabel, startGradient: copy.startGradient,
            backdrop: <GauntletBackdrop theme={theme} backdrop={copy.backdrop} />,
          }}
          onStart={onStart}
          onBack={onExit}
        />
      </SafeAreaView>
    );
  }

  if (done && finalStats) {
    return (
      <CongratulationsScreen
        message={copy.congrats}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onContinue ? onContinue() : onBack?.(); }}
        onHome={onExit}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: copy.rootBg }]} edges={['top']}>
      <TouchableOpacity onPress={onExit} style={[styles.back, { borderColor: theme.hudBorder }]}>
        <Text style={styles.backText}>← Exit</Text>
      </TouchableOpacity>
      <Session2HUD
        theme={theme}
        gameTitle={copy.gameTitle}
        emoji={copy.emoji}
        round={round}
        totalRounds={totalRounds}
        score={score}
        scoreLabel={copy.scoreLabel}
        hint={hint}
        showHint={showHint}
      />
      <View style={[styles.arena, { borderColor: theme.hudBorder }]}>
        <GauntletBackdrop theme={theme} backdrop={copy.backdrop} />
        {children}
      </View>
    </SafeAreaView>
  );
}

export function useGauntletExit(onBack?: () => void) {
  return () => { stopAllSpeech(); cleanupSounds(); onBack?.(); };
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  back: { position: 'absolute', top: 52, left: 12, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1 },
  backText: { color: '#F8FAFC', fontWeight: '800', fontSize: 13 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2 },
});
