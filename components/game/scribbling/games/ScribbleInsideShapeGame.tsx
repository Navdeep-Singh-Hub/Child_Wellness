// Game 3: Scribble Inside Shape
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { COLOR_PALETTE } from '../utils/gameData';
import GameCompleteScreen from '../components/GameCompleteScreen';

interface ScribbleInsideShapeGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

interface PathPoint {
  x: number;
  y: number;
}

export default function ScribbleInsideShapeGame({ onComplete, onBack }: ScribbleInsideShapeGameProps) {
  const { width, height } = useWindowDimensions();
  const [canvasSize, setCanvasSize] = useState({ width: width * 0.9, height: height * 0.5 });

  const [paths, setPaths] = useState<Array<{ points: PathPoint[]; color: string }>>([]);
  const [currentPath, setCurrentPath] = useState<PathPoint[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [outsideWarnings, setOutsideWarnings] = useState(0);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const isDrawingRef = useRef(false);
  const TOTAL_ROUNDS = 3;

  useEffect(() => {
    speakFeedback('Scribble inside the circle!');
    return () => stopAllAudio();
  }, []);

  const isPointInsideCircle = (x: number, y: number): boolean => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const radius = Math.min(canvasSize.width, canvasSize.height) * 0.3;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= radius;
  };

  const calculateFillPercentage = (): number => {
    // Simple approximation: count points inside circle
    let insidePoints = 0;
    let totalPoints = 0;
    paths.forEach((path) => {
      path.points.forEach((point) => {
        totalPoints++;
        if (isPointInsideCircle(point.x, point.y)) {
          insidePoints++;
        }
      });
    });
    return totalPoints > 0 ? (insidePoints / totalPoints) * 100 : 0;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        evt.preventDefault?.();
        const { locationX, locationY } = evt.nativeEvent;
        console.log('Touch start:', locationX, locationY, 'Color:', selectedColor);
        isDrawingRef.current = true;
        setIsDrawing(true);
        setCurrentPath([{ x: locationX, y: locationY }]);
        if (!isPointInsideCircle(locationX, locationY)) {
          setOutsideWarnings((prev) => prev + 1);
          playSoundEffect('incorrect');
          speakFeedback('Try to stay inside the circle!');
        } else {
          playSoundEffect('drawing');
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!isDrawingRef.current) return;
        evt.preventDefault?.();
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath((prev) => {
          if (prev.length === 0) {
            return [{ x: locationX, y: locationY }];
          }
          const newPath = [...prev, { x: locationX, y: locationY }];
          if (newPath.length % 20 === 0) {
            console.log('Path points:', newPath.length);
          }
          return newPath;
        });
        if (!isPointInsideCircle(locationX, locationY)) {
          setOutsideWarnings((prev) => prev + 1);
        }
      },
      onPanResponderRelease: () => {
        isDrawingRef.current = false;
        setIsDrawing(false);
        setCurrentPath((prev) => {
          if (prev.length > 0) {
            console.log('Saving path:', prev.length, 'points, color:', selectedColor);
            setPaths((paths) => {
              const newPaths = [...paths, { points: [...prev], color: selectedColor }];
              console.log('Total paths:', newPaths.length);
              return newPaths;
            });
          }
          return [];
        });
      },
    })
  ).current;

  const handleCheck = () => {
    const fillPercentage = calculateFillPercentage();
    if (fillPercentage >= 60) {
      setScore((prev) => prev + 1);
      playSoundEffect('correct');
      speakFeedback('Great job! You filled the circle!');
    } else {
      playSoundEffect('incorrect');
      speakFeedback(`You filled ${Math.round(fillPercentage)}%. Try to fill more!`);
    }

    if (round < TOTAL_ROUNDS - 1) {
      setTimeout(() => {
        setRound((prev) => prev + 1);
        setPaths([]);
        setCurrentPath([]);
        setOutsideWarnings(0);
      }, 2000);
    } else {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'scribble-inside-shape',
      });
    }
  };

  const pathToSvgString = (points: PathPoint[]): string => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  const fillPercentage = calculateFillPercentage();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Scribble Inside Shape</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Drawing Canvas */}
      <View 
        style={styles.canvasContainer} 
        {...panResponder.panHandlers}
        collapsable={false}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onLayout={(e) => {
          const { width: w, height: h } = e.nativeEvent.layout;
          if (w > 0 && h > 0) {
            setCanvasSize({ width: w, height: h });
          }
        }}
      >
        {canvasSize.width > 0 && canvasSize.height > 0 && (
          <Svg 
            width={canvasSize.width} 
            height={canvasSize.height} 
            style={styles.svg} 
            pointerEvents="none"
            viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
          >
          {/* Circle outline */}
          <Circle 
            cx={canvasSize.width / 2} 
            cy={canvasSize.height / 2} 
            r={Math.min(canvasSize.width, canvasSize.height) * 0.3} 
            stroke="#1E293B" 
            strokeWidth="4" 
            fill="none" 
          />
          {/* Scribbled paths */}
          {paths.map((path, idx) => {
            if (path.points.length < 2) return null;
            const pathString = pathToSvgString(path.points);
            return (
              <Path
                key={idx}
                d={pathString}
                stroke={path.color || selectedColor}
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            );
          })}
          {currentPath.length >= 2 && (
            <Path
              d={pathToSvgString(currentPath)}
              stroke={selectedColor}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
          </Svg>
        )}
      </View>
      
      {/* Status Text - Outside container to avoid blocking touches */}
      <View style={styles.statusContainer}>
        <Text style={styles.fillText} selectable={false}>Fill: {Math.round(fillPercentage)}%</Text>
        {outsideWarnings > 0 && <Text style={styles.warningText} selectable={false}>Try to stay inside!</Text>}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Color Palette */}
        <View style={styles.colorPalette}>
          {COLOR_PALETTE.slice(0, 5).map((color) => (
            <Pressable
              key={color}
              style={[styles.colorButton, { backgroundColor: color }, selectedColor === color && styles.colorButtonSelected]}
              onPress={() => {
                setSelectedColor(color);
                playSoundEffect('click');
              }}
            />
          ))}
        </View>

        {/* Check Button */}
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
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  fillText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 4,
  },
  controls: {
    padding: 20,
    gap: 16,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#1E293B',
    transform: [{ scale: 1.2 }],
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
