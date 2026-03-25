// Game 1: Free Scribble
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { BRUSH_SIZES, COLOR_PALETTE } from '../utils/gameData';
import GameCompleteScreen from '../components/GameCompleteScreen';

interface FreeScribbleGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

interface PathPoint {
  x: number;
  y: number;
}

export default function FreeScribbleGame({ onComplete, onBack }: FreeScribbleGameProps) {
  const { width, height } = useWindowDimensions();
  const [paths, setPaths] = useState<Array<{ points: PathPoint[]; color: string; strokeWidth: number }>>([]);
  const [currentPath, setCurrentPath] = useState<PathPoint[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<View>(null);
  const [canvasSize, setCanvasSize] = useState({ width: width - 40, height: height * 0.6 });

  useEffect(() => {
    speakFeedback('Scribble freely on the screen!');
    return () => {
      stopAllAudio();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 1;
        if (newTime >= 30 && !showComplete) {
          setShowComplete(true);
          playSoundEffect('celebration');
          speakFeedback('Great scribbling!');
        }
        return newTime;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showComplete]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !showComplete,
      onMoveShouldSetPanResponder: () => !showComplete,
      onPanResponderGrant: (evt) => {
        if (showComplete) return;
        const { locationX, locationY } = evt.nativeEvent;
        console.log('Touch started:', locationX, locationY);
        setIsDrawing(true);
        setCurrentPath([{ x: locationX, y: locationY }]);
        playSoundEffect('drawing');
      },
      onPanResponderMove: (evt) => {
        if (showComplete || !isDrawing) return;
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath((prev) => {
          if (prev.length === 0) {
            return [{ x: locationX, y: locationY }];
          }
          return [...prev, { x: locationX, y: locationY }];
        });
      },
      onPanResponderRelease: () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        setCurrentPath((prev) => {
          if (prev.length > 0) {
            setPaths((paths) => [...paths, { points: [...prev], color: selectedColor, strokeWidth: brushSize }]);
          }
          return [];
        });
      },
    })
  ).current;

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath([]);
    playSoundEffect('click');
  };

  const pathToSvgString = (points: PathPoint[]): string => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  const handleContinue = () => {
    const accuracy = timeElapsed >= 30 ? 100 : (timeElapsed / 30) * 100;
    onComplete({
      correct: 1,
      total: 1,
      accuracy,
      gameId: 'free-scribble',
    });
  };

  if (showComplete) {
    return (
      <View style={styles.completeContainer}>
        <Text style={styles.completeText}>Great scribbling!</Text>
        <View style={styles.completeButtons}>
          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Finish</Text>
          </Pressable>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Free Scribble</Text>
        <Text style={styles.timer}>{30 - timeElapsed}s</Text>
      </View>

      {/* Drawing Canvas */}
      <View 
        ref={canvasRef}
        style={styles.canvasContainer} 
        {...panResponder.panHandlers}
        collapsable={false}
        onLayout={(e) => {
          const { width: w, height: h } = e.nativeEvent.layout;
          if (w > 0 && h > 0) {
            setCanvasSize({ width: w, height: h });
          }
        }}
      >
        {canvasSize.width > 0 && canvasSize.height > 0 && (
          <Svg width={canvasSize.width} height={canvasSize.height} style={styles.svg} pointerEvents="none">
          {paths.map((path, idx) => (
            <Path
              key={idx}
              d={pathToSvgString(path.points)}
              stroke={path.color}
              strokeWidth={path.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          {currentPath.length > 0 && (
            <Path
              d={pathToSvgString(currentPath)}
              stroke={selectedColor}
              strokeWidth={brushSize}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
          </Svg>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Color Palette */}
        <View style={styles.colorPalette}>
          {COLOR_PALETTE.map((color) => (
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

        {/* Brush Size */}
        <View style={styles.brushSizeContainer}>
          {BRUSH_SIZES.map((size) => (
            <Pressable
              key={size}
              style={[styles.brushSizeButton, brushSize === size && styles.brushSizeButtonSelected]}
              onPress={() => {
                setBrushSize(size);
                playSoundEffect('click');
              }}
            >
              <View style={[styles.brushSizeIndicator, { width: size, height: size, borderRadius: size / 2 }]} />
            </Pressable>
          ))}
        </View>

        {/* Clear Button */}
        <Pressable style={styles.clearButton} onPress={clearCanvas}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.clearButtonText}>Clear</Text>
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
  timer: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 24,
    overflow: 'visible',
    position: 'relative',
    minHeight: 200,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  controls: {
    padding: 20,
    gap: 16,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#1E293B',
    transform: [{ scale: 1.2 }],
  },
  brushSizeContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brushSizeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  brushSizeButtonSelected: {
    backgroundColor: '#1E293B',
  },
  brushSizeIndicator: {
    backgroundColor: '#fff',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  completeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 32,
  },
  completeButtons: {
    gap: 16,
    width: '100%',
  },
  continueButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
