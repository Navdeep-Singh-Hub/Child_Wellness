/** Shared layout shell for OT L5 Session 9 visual reaction games */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import type { ReactionCopy, ReactionThemeTokens } from '@/components/game/occupational/level5/session9/reactionTheme';
import { ReactionHUD, ReactionIntro } from '@/components/game/occupational/level5/session9/shared/ReactionUI';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { configurePlaybackAudio } from '@/utils/configureAppAudio';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ShellProps = {
  theme: ReactionThemeTokens;
  copy: ReactionCopy;
  backdrop: React.ReactNode;
  showInfo: boolean;
  showCongrats: boolean;
  done: boolean;
  finalStats: { correct: number; total: number; xp: number } | null;
  round: number;
  totalRounds: number;
  score: number;
  hint?: string;
  showHint?: boolean;
  hudExtra?: React.ReactNode;
  roundLabel?: string;
  phaseLabel?: string;
  onStart: () => void;
  onExit: () => void;
  onContinue?: () => void;
  onBack?: () => void;
  children: React.ReactNode;
};

export function ReactionShell({
  theme, copy, backdrop, showInfo, showCongrats, done, finalStats, round, totalRounds, score, hint, showHint, hudExtra,
  roundLabel = 'ROUND', phaseLabel = 'LIVE',
  onStart, onExit, onContinue, onBack, children,
}: ShellProps) {
  const introCopy = { title: copy.gameTitle, emoji: copy.emoji, subtitle: copy.tagline, introDescription: copy.introBody };

  if (showInfo) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: copy.rootBg }]} edges={['top', 'bottom']}>
<<<<<<< HEAD
        <ReactionIntro
          theme={theme} copy={introCopy} chips={[...copy.chips]} startLabel={copy.startLabel} startColors={copy.startGradient}
          backdrop={backdrop}
          onStart={onStart} onBack={onExit}
=======
        <Session2Intro
          config={{
            theme, emoji: copy.emoji, title: copy.gameTitle, tagline: copy.tagline, body: copy.introBody,
            chips: copy.chips, startLabel: copy.startLabel, startGradient: copy.startGradient,
            backdrop: <ReactionBackdrop theme={theme} backdrop={copy.backdrop} />,
          }}
          onStart={() => {
            void configurePlaybackAudio();
            onStart();
          }}
          onBack={onExit}
>>>>>>> parent of d0342ff (Revert "fgh")
        />
      </SafeAreaView>
    );
  }

  if (showCongrats && done && finalStats) {
    return (
      <CongratulationsScreen
        message={copy.congrats} showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onContinue ? onContinue() : onBack?.(); }}
        onHome={onExit}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: copy.rootBg }]} edges={['top']}>
      <TouchableOpacity onPress={onExit} style={[styles.back, { borderColor: theme.hudBorder, backgroundColor: theme.hudGlass }]}>
        <Text style={[styles.backText, { color: theme.title }]}>← Exit</Text>
      </TouchableOpacity>
      <ReactionHUD
        theme={theme} gameTitle={`${copy.emoji} ${copy.gameTitle}`} roundLabel={roundLabel}
        round={round} total={totalRounds} score={score} scoreLabel={copy.scoreLabel}
        hint={showHint && hint ? hint : ''} phaseLabel={phaseLabel} playing={!done} extra={hudExtra}
      />
      <View style={[styles.arena, { borderColor: theme.hudBorder }]}>
        {backdrop}
        {children}
      </View>
    </SafeAreaView>
  );
}

export function useReactionExit(onBack?: () => void) {
  return () => { stopAllSpeech(); cleanupSounds(); onBack?.(); };
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  back: { position: 'absolute', top: 52, left: 14, zIndex: 50, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2 },
});
