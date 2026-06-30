/**
 * Factory for Session 8 moving-object track games
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import type { MultiTrackConfig } from '@/components/game/occupational/level5/session8/multiTrackConfig';
import type { TrackCopy, TrackThemeTokens } from '@/components/game/occupational/level5/session8/trackTheme';
import { TrackCountdown, TrackHUD, TrackIntro, TrackOrb } from '@/components/game/occupational/level5/session8/shared/MultiTrackUI';
import { useMultiTrackGame } from '@/components/game/occupational/level5/session8/shared/useMultiTrackGame';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Meta = {
  config: MultiTrackConfig;
  theme: TrackThemeTokens;
  copy: TrackCopy;
  rootBg: string;
  chips: string[];
  startLabel: string;
  startColors: readonly string[];
  gameTitle: string;
  roundLabel: string;
  scoreLabel: string;
  phaseLabel: string;
  backdrop: React.ReactNode;
};

export function createTrackGame(meta: Meta) {
  const Game: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
    const track = useMultiTrackGame({ config: meta.config, ttsComplete: meta.copy.ttsComplete, onBack });

    if (track.showInfo) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: meta.rootBg }} edges={['top', 'bottom']}>
          <TrackIntro theme={meta.theme} copy={meta.copy} chips={meta.chips} startLabel={meta.startLabel} startColors={meta.startColors} backdrop={meta.backdrop} onStart={track.handleStart} onBack={track.handleExit} />
        </SafeAreaView>
      );
    }

    if (track.showCongrats && track.done && track.finalStats) {
      return (
        <CongratulationsScreen message={meta.copy.congratsMessage} showButtons correct={track.finalStats.correct} total={track.finalStats.total} xpAwarded={track.finalStats.xp}
          onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={track.handleExit} />
      );
    }

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: meta.rootBg }} edges={['top']}>
        <TouchableOpacity onPress={track.handleExit} style={[styles.exit, { borderColor: meta.theme.hudBorder, backgroundColor: meta.theme.hudGlass }]}>
          <Text style={{ color: meta.theme.title, fontWeight: '800', fontSize: 14 }}>← Exit</Text>
        </TouchableOpacity>
        <TrackHUD theme={meta.theme} gameTitle={meta.gameTitle} roundLabel={meta.roundLabel} round={track.round} total={track.totalRounds} score={track.score} scoreLabel={meta.scoreLabel} hint={track.hint} phaseLabel={meta.phaseLabel} playing={track.phase === 'playing'} />
        <Pressable style={[styles.arena, { borderColor: meta.theme.hudBorder }]} onLayout={(e) => track.onLayout(e.nativeEvent.layout.width, e.nativeEvent.layout.height)} onPress={track.handleTap}>
          {meta.backdrop}
          {track.phase === 'playing' && track.objects.map((obj) => (
            <View key={obj.id} pointerEvents="none" style={{ position: 'absolute', left: obj.x - track.objectSize / 2, top: obj.y - track.objectSize / 2, zIndex: 10 }}>
              <TrackOrb size={track.objectSize} color={obj.color} emoji={obj.emoji} scale={obj.scale} pulse={obj.isTarget || (meta.config.mode === 'speed-pick' && obj.isFast === track.targetFast)} />
            </View>
          ))}
          {track.phase === 'countdown' && <TrackCountdown accent={meta.theme.accent} onDone={track.beginPlaying} />}
        </Pressable>
      </SafeAreaView>
    );
  };
  return Game;
}

const styles = StyleSheet.create({
  exit: { position: 'absolute', top: 52, left: 14, zIndex: 50, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2 },
});
