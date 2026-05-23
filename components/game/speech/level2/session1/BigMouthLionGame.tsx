import {
  DEFAULT_JAW_ROUNDS,
  JawGameOverlays,
  JawGameShell,
  WIDE_OPEN_RATIO,
  clearJawSpeech,
  hapticSuccess,
  speakJaw,
  useJawGameSession,
  useJawSense,
} from '@/components/game/speech/level2/shared/jawAwarenessShared';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const HOLD_MS = 1600;

export function BigMouthLionGame({ onBack, onComplete }: Props) {
  const session = useJawGameSession('big-mouth-lion', DEFAULT_JAW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const jaw = useJawSense(canPlay);
  const [holdPct, setHoldPct] = useState(0);
  const holdRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    speakJaw('Help the lion roar! Open your mouth wide!');
    return () => clearJawSpeech();
  }, []);

  useEffect(() => {
    doneRef.current = false;
    holdRef.current = null;
    setHoldPct(0);
    speakJaw('Open wide like a big lion roar!');
  }, [session.round]);

  useEffect(() => {
    if (!canPlay || doneRef.current) return;
    const tick = setInterval(() => {
      const wide = jaw.isOpen || jaw.ratio >= WIDE_OPEN_RATIO;
      const now = Date.now();
      if (!wide) {
        holdRef.current = null;
        setHoldPct(0);
        return;
      }
      if (!holdRef.current) holdRef.current = now;
      const held = now - holdRef.current;
      const pct = Math.min(1, held / HOLD_MS);
      setHoldPct(pct);
      if (held >= HOLD_MS) {
        doneRef.current = true;
        hapticSuccess();
        speakJaw('Roar! Amazing big mouth!');
        setTimeout(() => session.completeRound(), 900);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [canPlay, session, jaw.isOpen, jaw.ratio]);

  const wide = jaw.isOpen || jaw.ratio >= WIDE_OPEN_RATIO;

  return (
    <>
      <JawGameShell
        title='Big Mouth Lion'
        subtitle="Open wide for the lion's roar"
        skills="🦁 Mouth opening • 🔊 Roar pattern • 💪 Wide jaw"
        gradient={['#FEF3C7', '#FDE047']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        jaw={jaw}
      >
        <View style={styles.center}>
          <Text style={styles.lion}>{wide ? '🦁📣' : '🦁'}</Text>
          <Text style={styles.hint}>{wide ? 'Hold wide…' : 'Open your mouth wide!'}</Text>
          <View style={styles.bar}>
            <View style={[styles.fill, { width: `${holdPct * 100}%` }]} />
          </View>
        </View>
      </JawGameShell>
      <JawGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lion: { fontSize: 96 },
  hint: { fontSize: 18, fontWeight: '800', color: '#92400E', marginTop: 12 },
  bar: {
    width: '85%',
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    marginTop: 24,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#EAB308', borderRadius: 10 },
});
