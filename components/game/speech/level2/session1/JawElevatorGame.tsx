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
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const TRIPS_NEEDED = 4;

export function JawElevatorGame({ onBack, onComplete }: Props) {
  const session = useJawGameSession('jaw-elevator', DEFAULT_JAW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const jaw = useJawSense(canPlay);
  const [trips, setTrips] = useState(0);
  const tripsRef = useRef(0);
  const wasOpenRef = useRef(false);
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    speakJaw('Open your mouth to lift the elevator!');
    return () => clearJawSpeech();
  }, []);

  useEffect(() => {
    tripsRef.current = 0;
    setTrips(0);
    wasOpenRef.current = false;
    lift.setValue(0);
    speakJaw('Open wide to go up — close to come down.');
  }, [session.round, lift]);

  useEffect(() => {
    if (!canPlay) return;
    const target = jaw.isOpen ? 1 : 0;
    Animated.timing(lift, {
      toValue: target,
      duration: 280,
      useNativeDriver: true,
    }).start();

    if (jaw.isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
    }
    if (!jaw.isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
      tripsRef.current += 1;
      setTrips(tripsRef.current);
      hapticSuccess();
      speakJaw('Ding! Floor reached!');
      if (tripsRef.current >= TRIPS_NEEDED) {
        setTimeout(() => session.completeRound(), 700);
      }
    }
  }, [jaw.isOpen, canPlay, lift, session]);

  const translateY = lift.interpolate({
    inputRange: [0, 1],
    outputRange: ['70%', '8%'],
  });

  return (
    <>
      <JawGameShell
        title="Jaw Elevator"
        subtitle="Open mouth to lift the elevator"
        skills="🛗 Controlled opening • ⬆️ Jaw control • 🎯 Timing"
        gradient={['#E0E7FF', '#A5B4FC']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        jaw={jaw}
      >
        <View style={styles.shaft}>
          <View style={styles.track} />
          <Animated.View style={[styles.car, { transform: [{ translateY }] }]}>
            <Text style={styles.carEmoji}>🛗</Text>
          </Animated.View>
          <Text style={styles.trips}>Trips: {trips} / {TRIPS_NEEDED}</Text>
        </View>
      </JawGameShell>
      <JawGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  shaft: { flex: 1, marginHorizontal: 8 },
  track: {
    flex: 1,
    marginHorizontal: '35%',
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
  },
  car: { position: 'absolute', left: '30%', alignItems: 'center' },
  carEmoji: { fontSize: 56 },
  trips: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: '100%',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 16,
    color: '#3730A3',
  },
});
