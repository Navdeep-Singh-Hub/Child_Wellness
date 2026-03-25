// Game 2: Color the Picture
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { COLOR_PALETTE, COLORING_SHAPES } from '../utils/gameData';
import GameCompleteScreen from '../components/GameCompleteScreen';

interface ColorPictureGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

interface ColoredArea {
  path: string;
  color: string;
}

export default function ColorPictureGame({ onComplete, onBack }: ColorPictureGameProps) {
  const { width, height } = useWindowDimensions();
  const [currentShape, setCurrentShape] = useState(0);
  const [coloredAreas, setColoredAreas] = useState<ColoredArea[]>([]);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: width * 0.9, height: height * 0.5 });
  const TOTAL_ROUNDS = 2;

  useEffect(() => {
    speakFeedback(`Color the ${COLORING_SHAPES[currentShape].name.toLowerCase()}!`);
    return () => stopAllAudio();
  }, [currentShape]);

  const handleColorArea = (x: number, y: number) => {
    // Simple coloring: add a colored circle at touch point
    const newArea: ColoredArea = {
      path: `M ${x} ${y} m -20,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0`,
      color: selectedColor,
    };
    setColoredAreas((prev) => [...prev, newArea]);
    playSoundEffect('click');
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        handleColorArea(locationX, locationY);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        handleColorArea(locationX, locationY);
      },
    })
  ).current;

  const handleNext = () => {
    if (coloredAreas.length > 0) {
      setScore((prev) => prev + 1);
      playSoundEffect('correct');
    }
    if (round < TOTAL_ROUNDS - 1) {
      setRound((prev) => prev + 1);
      setCurrentShape((prev) => (prev + 1) % COLORING_SHAPES.length);
      setColoredAreas([]);
    } else {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'color-picture',
      });
    }
  };

  const shape = COLORING_SHAPES[currentShape];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Color the Picture</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Drawing Canvas */}
      <View 
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
          <Svg width={canvasSize.width} height={canvasSize.height} style={styles.svg} viewBox={shape.viewBox} pointerEvents="none">
          {/* Shape outline */}
          <Path d={shape.svgPath} stroke="#1E293B" strokeWidth="4" fill="none" />
          {/* Colored areas */}
          {coloredAreas.map((area, idx) => (
            <Path key={idx} d={area.path} fill={area.color} opacity={0.6} />
          ))}
          </Svg>
        )}
        <Text style={styles.shapeName}>{shape.name}</Text>
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

        {/* Next Button */}
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  shapeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
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
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
