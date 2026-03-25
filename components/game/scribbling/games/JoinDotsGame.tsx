// Game 4: Join the Dots
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { DOT_PATTERNS } from '../utils/gameData';
import GameCompleteScreen from '../components/GameCompleteScreen';

interface JoinDotsGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

interface ConnectedDot {
  from: number;
  to: number;
}

export default function JoinDotsGame({ onComplete, onBack }: JoinDotsGameProps) {
  const { width, height } = useWindowDimensions();
  const [canvasSize, setCanvasSize] = useState({ width: width * 0.9, height: height * 0.5 });
  const DOT_RADIUS = 20;
  const SNAP_DISTANCE = 80; // Increased for easier snapping

  const [currentPattern, setCurrentPattern] = useState(0);
  const [connectedDots, setConnectedDots] = useState<ConnectedDot[]>([]);
  const [currentLine, setCurrentLine] = useState<{ from: { x: number; y: number; id: number } | null; to: { x: number; y: number } | null }>({ from: null, to: null });
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const currentLineRef = useRef<{ from: { x: number; y: number; id: number } | null; to: { x: number; y: number } | null }>({ from: null, to: null });
  const TOTAL_ROUNDS = 3;

  useEffect(() => {
    speakFeedback('Connect the dots in order!');
    return () => stopAllAudio();
  }, [currentPattern]);

  const pattern = DOT_PATTERNS[currentPattern % DOT_PATTERNS.length];

  // Scale dots to match canvas size (assuming original pattern is 200x200)
  const BASE_SIZE = 200;
  const scaleX = canvasSize.width > 0 ? canvasSize.width / BASE_SIZE : 1;
  const scaleY = canvasSize.height > 0 ? canvasSize.height / BASE_SIZE : 1;
  const scaledDots = pattern.dots.map((dot) => ({
    x: dot.x * scaleX,
    y: dot.y * scaleY,
    id: dot.id,
  }));
  
  // Center the pattern in the canvas
  const offsetX = (canvasSize.width - (BASE_SIZE * scaleX)) / 2;
  const offsetY = (canvasSize.height - (BASE_SIZE * scaleY)) / 2;
  const centeredDots = scaledDots.map((dot) => ({
    x: dot.x + offsetX,
    y: dot.y + offsetY,
    id: dot.id,
  }));

  const findNearestDot = (x: number, y: number): { x: number; y: number; id: number } | null => {
    if (centeredDots.length === 0) return null;
    
    let nearest: { x: number; y: number; id: number } | null = null;
    let minDist = Infinity;

    centeredDots.forEach((dot) => {
      const dx = x - dot.x;
      const dy = y - dot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        if (dist < SNAP_DISTANCE) {
          nearest = dot;
        }
      }
    });

    console.log('Min distance:', minDist.toFixed(1), nearest ? `Found: ${nearest.id}` : 'Not found');
    return nearest;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        evt.preventDefault?.();
        const { locationX, locationY } = evt.nativeEvent;
        console.log('Touch:', locationX, locationY, 'Canvas:', canvasSize.width, 'x', canvasSize.height);
        const nearest = findNearestDot(locationX, locationY);
        if (nearest) {
          console.log('Found dot:', nearest.id);
          const newLine = { from: nearest, to: null };
          currentLineRef.current = newLine;
          setCurrentLine(newLine);
          playSoundEffect('click');
        }
      },
      onPanResponderMove: (evt) => {
        evt.preventDefault?.();
        if (!currentLineRef.current.from) {
          console.log('Move but no from dot');
          return;
        }
        const { locationX, locationY } = evt.nativeEvent;
        const nearest = findNearestDot(locationX, locationY);
        if (nearest && nearest.id !== currentLineRef.current.from.id) {
          console.log('Snapped to dot:', nearest.id);
          const newLine = { from: currentLineRef.current.from, to: nearest };
          currentLineRef.current = newLine;
          setCurrentLine(newLine);
        } else {
          const newLine = { from: currentLineRef.current.from, to: { x: locationX, y: locationY, id: -1 } };
          currentLineRef.current = newLine;
          setCurrentLine(newLine);
        }
      },
      onPanResponderRelease: () => {
        if (currentLineRef.current.from && currentLineRef.current.to && currentLineRef.current.to.id !== -1) {
          const newConnection: ConnectedDot = {
            from: currentLineRef.current.from.id,
            to: currentLineRef.current.to.id,
          };
          console.log('Connection:', newConnection);
          setConnectedDots((prev) => [...prev, newConnection]);
          playSoundEffect('correct');
        }
        currentLineRef.current = { from: null, to: null };
        setCurrentLine({ from: null, to: null });
      },
    })
  ).current;

  const checkCompletion = (): boolean => {
    if (connectedDots.length < pattern.correctOrder.length - 1) return false;
    for (let i = 0; i < pattern.correctOrder.length - 1; i++) {
      const expectedFrom = pattern.correctOrder[i];
      const expectedTo = pattern.correctOrder[i + 1];
      const found = connectedDots.some((conn) => conn.from === expectedFrom && conn.to === expectedTo);
      if (!found) return false;
    }
    return true;
  };

  const handleCheck = () => {
    if (checkCompletion()) {
      setScore((prev) => prev + 1);
      playSoundEffect('celebration');
      speakFeedback('Perfect! You connected all the dots!');
    } else {
      playSoundEffect('incorrect');
      speakFeedback('Try connecting the dots in the correct order!');
    }

    if (round < TOTAL_ROUNDS - 1) {
      setTimeout(() => {
        setRound((prev) => prev + 1);
        setCurrentPattern((prev) => prev + 1);
        setConnectedDots([]);
        setCurrentLine({ from: null, to: null });
      }, 2000);
    } else {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'join-dots',
      });
    }
  };

  const isComplete = checkCompletion();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Join the Dots</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Drawing Canvas */}
      <View 
        style={styles.canvasContainer} 
        {...panResponder.panHandlers}
        collapsable={false}
        onLayout={(e) => {
          const { width: w, height: h } = e.nativeEvent.layout;
          console.log('📐 Canvas layout:', w, 'x', h);
          if (w > 0 && h > 0) {
            setCanvasSize({ width: w, height: h });
            console.log('✅ Canvas size set to:', w, 'x', h);
          }
        }}
      >
        {canvasSize.width > 0 && canvasSize.height > 0 && (
          <Svg width={canvasSize.width} height={canvasSize.height} style={styles.svg} pointerEvents="none">
          {/* Dot numbers as circles with text overlay */}
          {centeredDots.map((dot) => (
            <React.Fragment key={`fragment-${dot.id}`}>
              <Circle cx={dot.x} cy={dot.y} r={DOT_RADIUS - 8} fill="#fff" />
            </React.Fragment>
          ))}
          {/* Connected lines */}
          {connectedDots.map((conn, idx) => {
            const fromDot = centeredDots.find((d) => d.id === conn.from);
            const toDot = centeredDots.find((d) => d.id === conn.to);
            if (!fromDot || !toDot) return null;
            return (
              <Line
                key={idx}
                x1={fromDot.x}
                y1={fromDot.y}
                x2={toDot.x}
                y2={toDot.y}
                stroke="#3B82F6"
                strokeWidth="4"
              />
            );
          })}
          {/* Current line being drawn */}
          {currentLine.from && currentLine.to && (
            <Line
              x1={currentLine.from.x}
              y1={currentLine.from.y}
              x2={currentLine.to.x}
              y2={currentLine.to.y}
              stroke="#93C5FD"
              strokeWidth="3"
              strokeDasharray="5,5"
            />
          )}
          {/* Dots */}
          {centeredDots.map((dot) => (
            <Circle key={dot.id} cx={dot.x} cy={dot.y} r={DOT_RADIUS} fill="#3B82F6" stroke="#1E293B" strokeWidth="2" />
          ))}
          </Svg>
        )}
        {/* Dot number labels */}
        {canvasSize.width > 0 && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {centeredDots.map((dot) => (
              <View
                key={`label-${dot.id}`}
                style={{
                  position: 'absolute',
                  left: dot.x - 10,
                  top: dot.y - 10,
                  width: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={styles.dotLabel}>{dot.id}</Text>
              </View>
            ))}
          </View>
        )}
        {isComplete && <Text style={styles.completeText}>Great! Shape complete!</Text>}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.checkButton} onPress={handleCheck}>
          <Text style={styles.checkButtonText}>Check</Text>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  roundText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  completeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 16,
  },
  dotLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  controls: {
    padding: 20,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
