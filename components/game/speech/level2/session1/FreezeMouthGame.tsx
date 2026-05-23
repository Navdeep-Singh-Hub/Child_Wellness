import {
  DEFAULT_JAW_ROUNDS,
  JawGameOverlays,
  JawGameShell,
  clearJawSpeech,
  hapticSuccess,
  speakJaw,
  useJawGameSession,
  useJawSense,
} from '@/components/game/speech/level2/shared/jawAwarenessShared';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const FREEZE_HOLD_MS = 2800;

export function FreezeMouthGame({ onBack, onComplete }: Props) {
  const session = useJawGameSession('freeze-mouth', DEFAULT_JAW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const jaw = useJawSense(canPlay);
  const [phase, setPhase] = useState<'ready' | 'freeze' | 'done'>('ready');
  const [progress, setProgress] = useState(0);
  const holdRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    speakJaw('Freeze Mouth! Hold your mouth open when you see FREEZE!');
    return () => clearJawSpeech();
  }, []);

  useEffect(() => {
    doneRef.current = false;
    holdRef.current = null;
    setProgress(0);
    setPhase('ready');
    const t = setTimeout(() => {
      setPhase('freeze');
      speakJaw('FREEZE! Hold mouth open!');
    }, 1200);
    return () => clearTimeout(t);
  }, [session.round]);

  useEffect(() => {
    if (!canPlay || phase !== 'freeze' || doneRef.current) return;
    const tick = setInterval(() => {
      if (!jaw.isOpen) {
        holdRef.current = null;
        setProgress(0);
        return;
      }
      const now = Date.now();
      if (!holdRef.current) holdRef.current = now;
      const held = now - holdRef.current;
      setProgress(Math.min(1, held / FREEZE_HOLD_MS));
      if (held >= FREEZE_HOLD_MS) {
        doneRef.current = true;
        setPhase('done');
        hapticSuccess();
        speakJaw('Great freeze! You held it!');
        setTimeout(() => session.completeRound(), 900);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [phase, jaw.isOpen, canPlay, session]);

  return (
    <>
      <JawGameShell
        title="Freeze Mouth"
        subtitle="Hold mouth open on FREEZE"
        skills="⏱️ Jaw endurance • 😮 Sustained open • 🧊 Control"
        gradient={['#CFFAFE', '#67E8F9']}
        accent="#0891B2"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        jaw={jaw}
      >
        <View style={styles.center}>
          <Text style={styles.freeze}>
            {phase === 'ready' ? 'Get ready…' : phase === 'freeze' ? '🧊 FREEZE! 😮' : '✅ Unfrozen!'}
          </Text>
          <View style={styles.bar}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.hint}>Keep mouth open until the bar fills</Text>
        </View>
      </JawGameShell>
      <JawGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  freeze: { fontSize: 32, fontWeight: '900', color: '#0E7490', textAlign: 'center' },
  bar: {
    width: '85%',
    height: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    marginTop: 28,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#06B6D4', borderRadius: 10 },
  hint: { marginTop: 14, fontSize: 15, fontWeight: '700', color: '#155E75' },
});
