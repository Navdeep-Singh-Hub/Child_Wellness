import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useFluentSession,
  DEFAULT_VOICE_ROUNDS,
  matchStep,
  useSpeechHitCounter,
  createBurstDetector,
  ADVENTURE_SCENES,
} from '@/components/game/speech/level3/shared/fluentSpeechGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function TalkingAdventureGame({ onBack, onComplete }: Props) {
  const session = useFluentSession('talking-adventure', DEFAULT_VOICE_ROUNDS);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const scene = ADVENTURE_SCENES[sceneIndex % ADVENTURE_SCENES.length];
  const speech = useSpeechHitCounter(true, scene.cue.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 500 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  useEffect(() => {
    speakGame('Speak to continue your adventure!');
    speakGame(ADVENTURE_SCENES[0].story);
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setSceneIndex(0);
    setProgress(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    burstRef.current.reset();
    speech.resetHits();
    const s = ADVENTURE_SCENES[0];
    speakGame(s.story);
    setTimeout(() => speakGame(s.speakPrompt), 1200);
  }, [session.round]);

  useEffect(() => {
    speech.resetHits();
    burstRef.current.reset();
    holdRef.current = null;
  }, [sceneIndex]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current || lockRef.current) return;
      const { progress: p, matched } = matchStep(
        scene.cue,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
      );
      setProgress(p);
      if (!matched) return;
      lockRef.current = true;
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      const next = sceneIndex + 1;
      if (next >= ADVENTURE_SCENES.length) {
        roundDoneRef.current = true;
        speakGame('Adventure complete! You are a hero!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        setSceneIndex(next);
        const s = ADVENTURE_SCENES[next];
        speakGame(s.story);
        setTimeout(() => {
          speakGame(s.speakPrompt);
          lockRef.current = false;
        }, 1000);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session, scene, sceneIndex, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Talking Adventure"
        subtitle="Speak to continue the story"
        skills="📖 Functional speech • 🗣️ Story • ✨ Adventure"
        gradient={['#FEF3C7', '#FDE68A']}
        accent="#D97706"
        onBack={onBack}
        progress={sceneIndex}
        progressTotal={ADVENTURE_SCENES.length}
        roundLabel={`Scene ${sceneIndex + 1}/${ADVENTURE_SCENES.length} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.emoji}>{scene.emoji}</Text>
              <Text style={styles.title}>{scene.title}</Text>
              <Text style={styles.story}>{scene.story}</Text>
              <Text style={styles.prompt}>{scene.speakPrompt}</Text>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
            </View>
          );
        }}
      </VoiceGameFrame>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  emoji: { fontSize: 80 },
  title: { fontSize: 26, fontWeight: '900', color: '#B45309', marginTop: 8 },
  story: { fontSize: 18, fontWeight: '600', color: '#78350F', marginTop: 12, textAlign: 'center' },
  prompt: { fontSize: 20, fontWeight: '800', color: '#92400E', marginTop: 16 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 8 },
});
