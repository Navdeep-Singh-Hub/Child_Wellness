/**
 * OT Level 5 · Session 6 · Game 1 — Lightning Catch
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { FAST_CATCH_CONFIG } from '@/components/game/occupational/level5/session6/speedCatchConfig';
import { LIGHTNING_CATCH_COPY as COPY, LIGHTNING_CATCH_THEME as T } from '@/components/game/occupational/level5/session6/lightningCatch/lightningCatchTheme';
import { ArenaBackdrop, BlazeBall, LightningCatchHUD, LightningCatchInfoScreen } from '@/components/game/occupational/level5/session6/lightningCatch/LightningCatchVisuals';
import { SpeedCatchCountdown } from '@/components/game/occupational/level5/session6/shared/SpeedCatchCountdown';
import { BALL_SIZE, useSpeedCatchGame } from '@/components/game/occupational/level5/session6/shared/useSpeedCatchGame';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const LightningCatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const catch_ = useSpeedCatchGame({ config: FAST_CATCH_CONFIG, ttsComplete: COPY.ttsComplete, onBack });

  if (catch_.showInfo) return <SafeAreaView style={styles.root} edges={['top', 'bottom']}><LightningCatchInfoScreen onStart={catch_.handleStart} onBack={catch_.handleExit} /></SafeAreaView>;
  if (catch_.showCongrats && catch_.done && catch_.finalStats) {
    return <CongratulationsScreen message={COPY.congratsMessage} showButtons correct={catch_.finalStats.correct} total={catch_.finalStats.total} xpAwarded={catch_.finalStats.xp}
      onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={catch_.handleExit} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={catch_.handleExit} style={styles.exitBtn}><Text style={styles.exitText}>← Exit</Text></TouchableOpacity>
      <LightningCatchHUD round={catch_.round} total={catch_.totalRounds} score={catch_.score} hint={catch_.hint} playing={catch_.phase === 'playing'} />
      <Pressable style={styles.arena} onLayout={(e) => catch_.onLayout(e.nativeEvent.layout.width, e.nativeEvent.layout.height)} onPress={catch_.handleGameTap}>
        <ArenaBackdrop />
        {catch_.phase === 'playing' && (
          <Animated.View style={[styles.ballPos, catch_.ballStyle]} pointerEvents="none"><BlazeBall size={BALL_SIZE} pulse /></Animated.View>
        )}
        {catch_.phase === 'countdown' && <SpeedCatchCountdown accent={T.accent} onDone={catch_.startPlaying} />}
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#450A0A' },
  exitBtn: { position: 'absolute', top: 52, left: 14, zIndex: 50, backgroundColor: 'rgba(69,10,10,0.9)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.hudBorder },
  exitText: { color: T.title, fontWeight: '800', fontSize: 14 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: T.hudBorder },
  ballPos: { position: 'absolute', zIndex: 10 },
});

export default LightningCatchGame;
