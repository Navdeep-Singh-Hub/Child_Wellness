/**
 * Factory for Session 7 depth game shells
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import type { DepthGameConfig } from '@/components/game/occupational/level5/session7/depthDistanceConfig';
import type { DepthCopy, DepthGameMeta, DepthThemeTokens } from '@/components/game/occupational/level5/session7/depthTheme';
import { DepthCountdown, DepthPlayfield } from '@/components/game/occupational/level5/session7/shared/DepthPlayfield';
import { DepthGameHUD, DepthIntroScreen } from '@/components/game/occupational/level5/session7/shared/DepthGameUI';
import { useDepthDistanceGame } from '@/components/game/occupational/level5/session7/shared/useDepthDistanceGame';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Meta = DepthGameMeta & {
  config: DepthGameConfig;
  theme: DepthThemeTokens;
  copy: DepthCopy;
  backdrop: React.ReactNode;
};

export function createDepthGame(meta: Meta) {
  const Game: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
    const depth = useDepthDistanceGame({ config: meta.config, ttsComplete: meta.copy.ttsComplete, onBack });

    if (depth.showInfo) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: meta.rootBg }} edges={['top', 'bottom']}>
          <DepthIntroScreen theme={meta.theme} copy={meta.copy} chips={[...meta.chips]} startLabel={meta.startLabel} startColors={meta.startColors} backdrop={meta.backdrop} onStart={depth.handleStart} onBack={depth.handleExit} />
        </SafeAreaView>
      );
    }

    if (depth.showCongrats && depth.done && depth.finalStats) {
      return (
        <CongratulationsScreen message={meta.copy.congratsMessage} showButtons correct={depth.finalStats.correct} total={depth.finalStats.total} xpAwarded={depth.finalStats.xp}
          onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={depth.handleExit} />
      );
    }

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: meta.rootBg }} edges={['top']}>
        <TouchableOpacity onPress={depth.handleExit} style={[styles.exit, { borderColor: meta.theme.hudBorder, backgroundColor: meta.theme.hudGlass }]}>
          <Text style={{ color: meta.theme.title, fontWeight: '800', fontSize: 14 }}>← Exit</Text>
        </TouchableOpacity>
        <DepthGameHUD theme={meta.theme} gameTitle={meta.gameTitle} roundLabel={meta.roundLabel} round={depth.round} total={depth.totalRounds} score={depth.score} scoreLabel={meta.scoreLabel} hint={depth.hint} phaseLabel={meta.phaseLabel} playing={depth.phase === 'playing'} />
        <Pressable style={[styles.arena, { borderColor: meta.theme.hudBorder }]} onLayout={(e) => depth.onLayout(e.nativeEvent.layout.width, e.nativeEvent.layout.height)} onPress={depth.handleTap}>
          {meta.backdrop}
          {depth.phase === 'playing' && (
            <DepthPlayfield mode={meta.config.mode} accent={meta.theme.accent} nearFarTargets={depth.nearFarTargets} anchorPoint={depth.anchorPoint} zoomPos={depth.zoomPos} zoomScale={depth.zoomScale} zoomReady={depth.zoomReady} fallPos={depth.fallPos} fallActive={depth.fallActive} shrinkPos={depth.shrinkPos} shrinkSize={depth.shrinkSize} shrinkActive={depth.shrinkActive} layers={depth.layers} />
          )}
          {depth.phase === 'countdown' && <DepthCountdown accent={meta.theme.accent} onDone={depth.beginPlaying} />}
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
