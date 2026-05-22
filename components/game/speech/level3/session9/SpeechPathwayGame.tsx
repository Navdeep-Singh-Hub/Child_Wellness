import {
  VowelGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useVoiceGameSession,
  DEFAULT_VOICE_ROUNDS,
  vowelMatch,
  type VowelSense,
} from '@/components/game/speech/level3/shared/vowelGameShared';
import {
  matchStep,
  useSpeechHitCounter,
  createBurstDetector,
  SPEECH_PATHWAY,
  type PathwayStep,
  type TapTarget,
} from '@/components/game/speech/level3/shared/twoPartVerbalGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const OPEN_MS = 900;

export function SpeechPathwayGame({ onBack, onComplete }: Props) {
  const session = useVoiceGameSession('speech-pathway', DEFAULT_VOICE_ROUNDS);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const step: PathwayStep = SPEECH_PATHWAY[stepIndex] ?? SPEECH_PATHWAY[0];
  const soundCue = step.type === 'sound' ? step.cue : null;
  const tapTarget = step.type === 'tap' ? step.target : null;
  const speech = useSpeechHitCounter(
    step.type === 'sound',
    soundCue?.words ?? [],
  );
  const burstRef = useRef(createBurstDetector({ cooldownMs: 500 }));
  const openHoldRef = useRef<number | null>(null);
  const soundHoldRef = useRef<number | null>(null);
  const senseRef = useRef<VowelSense | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  const advance = () => {
    if (stepIndex + 1 >= SPEECH_PATHWAY.length) {
      roundDoneRef.current = true;
      speakGame('Pathway complete! Amazing planning!');
      setTimeout(() => session.completeRound(), 900);
      return;
    }
    const next = stepIndex + 1;
    setStepIndex(next);
    setProgress(0);
    openHoldRef.current = null;
    soundHoldRef.current = null;
    burstRef.current.reset();
    speech.resetHits();
    const s = SPEECH_PATHWAY[next];
    if (s.type === 'open') speakGame(s.hint);
    else if (s.type === 'sound') speakGame(`Say ${s.cue.label}!`);
    else speakGame(`Tap the ${s.target.label}!`);
  };

  useEffect(() => {
    speakGame('Complete the speech pathway, step by step!');
    speakGame(SPEECH_PATHWAY[0].type === 'open' ? SPEECH_PATHWAY[0].hint : 'Start!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setStepIndex(0);
    setProgress(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    openHoldRef.current = null;
    soundHoldRef.current = null;
    burstRef.current.reset();
    speech.resetHits();
    const s = SPEECH_PATHWAY[0];
    if (s.type === 'open') speakGame(s.hint);
    else if (s.type === 'sound') speakGame(`Say ${s.cue.label}!`);
    else speakGame(`Tap the ${s.target.label}!`);
  }, [session.round]);

  useEffect(() => {
    speech.resetHits();
    burstRef.current.reset();
    soundHoldRef.current = null;
    openHoldRef.current = null;
  }, [stepIndex]);

  useEffect(() => {
    if (step.type === 'tap' || session.gameFinished || roundDoneRef.current || lockRef.current) return;
    const tick = setInterval(() => {
      const sense = senseRef.current;
      if (!sense) return;

      if (step.type === 'open') {
        const useCamera = Platform.OS === 'web' && sense.isDetecting;
        if (useCamera) {
          const { progress: p, matched } = vowelMatch(sense, 'A', OPEN_MS, openHoldRef);
          setProgress(p);
          if (!matched) return;
        } else if (sense.voiceActive && sense.voiceLevel >= 0.22) {
          if (!openHoldRef.current) openHoldRef.current = Date.now();
          const held = Date.now() - openHoldRef.current;
          setProgress(Math.min(1, held / OPEN_MS));
          if (held < OPEN_MS) return;
        } else {
          openHoldRef.current = null;
          setProgress(0);
          return;
        }
      } else if (step.type === 'sound' && soundCue) {
        const { progress: p, matched } = matchStep(
          soundCue,
          voiceRef.current,
          speech,
          burstRef.current,
          soundHoldRef,
        );
        setProgress(p);
        if (!matched) return;
      }

      lockRef.current = true;
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      advance();
      setTimeout(() => {
        lockRef.current = false;
      }, 500);
    }, 50);
    return () => clearInterval(tick);
  }, [step, session, speech.useSpeech, stepIndex]);

  const onTap = (t: TapTarget) => {
    if (step.type !== 'tap' || !tapTarget || lockRef.current || roundDoneRef.current) return;
    if (t.id !== tapTarget.id) {
      speakGame(`Tap ${tapTarget.emoji}!`);
      return;
    }
    lockRef.current = true;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    advance();
    setTimeout(() => {
      lockRef.current = false;
    }, 500);
  };

  const nodeIcon = (s: PathwayStep, i: number) => {
    if (s.type === 'open') return '😮';
    if (s.type === 'sound') return s.cue.label;
    return s.target.emoji;
  };

  return (
    <>
      <VowelGameFrame
        title="Speech Pathway"
        subtitle="Complete the speech sequence"
        skills="🗺️ Planning • 📋 Sequence • 🗣️ Speech"
        gradient={['#EDE9FE', '#DDD6FE']}
        accent="#7C3AED"
        onBack={onBack}
        progress={stepIndex}
        progressTotal={SPEECH_PATHWAY.length}
        roundLabel={`Step ${stepIndex + 1}/${SPEECH_PATHWAY.length} · Round ${session.round}/${session.rounds}`}
        showCamera={Platform.OS === 'web' && step.type === 'open'}
      >
        {(sense) => {
          senseRef.current = sense;
          voiceRef.current = { level: sense.voiceLevel, active: sense.voiceActive };
          return (
            <View style={styles.center}>
              <View style={styles.path}>
                {SPEECH_PATHWAY.map((s, i) => (
                  <View key={i} style={styles.nodeWrap}>
                    <View
                      style={[
                        styles.node,
                        i < stepIndex && styles.nodeDone,
                        i === stepIndex && styles.nodeActive,
                      ]}
                    >
                      <Text style={styles.nodeText}>{nodeIcon(s, i)}</Text>
                    </View>
                    {i < SPEECH_PATHWAY.length - 1 && (
                      <View style={[styles.line, i < stepIndex && styles.lineDone]} />
                    )}
                  </View>
                ))}
              </View>
              {step.type === 'open' && (
                <>
                  <Text style={styles.hint}>{step.hint}</Text>
                  <View style={styles.bar}>
                    <View style={[styles.fill, { width: `${progress * 100}%` }]} />
                  </View>
                </>
              )}
              {step.type === 'sound' && soundCue && (
                <>
                  <Text style={styles.hint}>Say “{soundCue.label}”</Text>
                  <View style={styles.bar}>
                    <View style={[styles.fill, { width: `${progress * 100}%` }]} />
                  </View>
                </>
              )}
              {step.type === 'tap' && tapTarget && (
                <Pressable style={styles.tapBtn} onPress={() => onTap(tapTarget)}>
                  <Text style={styles.tapEmoji}>{tapTarget.emoji}</Text>
                  <Text style={styles.tapLabel}>Tap {tapTarget.label}</Text>
                </Pressable>
              )}
            </View>
          );
        }}
      </VowelGameFrame>
      <VoiceGameOverlays
        showRoundSuccess={session.showRoundSuccess}
        gameFinished={session.gameFinished}
        finalStats={session.finalStats}
        onBack={onBack}
        onComplete={onComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  path: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  nodeWrap: { flexDirection: 'row', alignItems: 'center' },
  node: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C4B5FD',
  },
  nodeActive: { borderColor: '#7C3AED', backgroundColor: '#EDE9FE', transform: [{ scale: 1.1 }] },
  nodeDone: { backgroundColor: '#8B5CF6', borderColor: '#6D28D9' },
  nodeText: { fontSize: 14, fontWeight: '900', color: '#5B21B6' },
  line: { width: 16, height: 3, backgroundColor: '#C4B5FD' },
  lineDone: { backgroundColor: '#8B5CF6' },
  hint: { fontSize: 20, fontWeight: '800', color: '#5B21B6', marginTop: 8 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 8 },
  tapBtn: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 3,
    borderColor: '#8B5CF6',
    marginTop: 12,
  },
  tapEmoji: { fontSize: 64 },
  tapLabel: { fontSize: 18, fontWeight: '900', color: '#5B21B6', marginTop: 8 },
});
