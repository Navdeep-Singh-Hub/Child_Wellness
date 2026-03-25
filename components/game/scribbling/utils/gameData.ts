// Game data for Scribbling & Gripping module

export interface GameInfo {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  duration: string;
}

export const GAMES: GameInfo[] = [
  {
    id: 'free-scribble',
    title: 'Free Scribble',
    description: 'Scribble freely and practice hand movement',
    emoji: '✏️',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
  {
    id: 'color-picture',
    title: 'Color the Picture',
    description: 'Color inside the shapes',
    emoji: '🎨',
    color: '#FBCFE8',
    duration: '2-3 mins',
  },
  {
    id: 'scribble-inside-shape',
    title: 'Scribble Inside Shape',
    description: 'Scribble inside the circle',
    emoji: '⭕',
    color: '#A7F3D0',
    duration: '2-3 mins',
  },
  {
    id: 'join-dots',
    title: 'Join the Dots',
    description: 'Connect the dots to make shapes',
    emoji: '🔗',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
];

// Color palette for drawing games
export const COLOR_PALETTE = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#6C5CE7', // Indigo
];

// Brush sizes
export const BRUSH_SIZES = [8, 16, 24, 32];

// Simple line art shapes for coloring
export interface ColoringShape {
  id: string;
  name: string;
  svgPath: string;
  viewBox: string;
}

export const COLORING_SHAPES: ColoringShape[] = [
  {
    id: 'butterfly',
    name: 'Butterfly',
    svgPath: 'M 100 100 L 80 80 L 60 100 L 80 120 Z M 100 100 L 120 80 L 140 100 L 120 120 Z M 100 100 L 100 140',
    viewBox: '0 0 200 200',
  },
  {
    id: 'flower',
    name: 'Flower',
    svgPath: 'M 100 60 C 90 70, 80 80, 100 100 C 120 80, 110 70, 100 60 M 100 100 C 80 90, 70 100, 100 120 C 130 100, 120 90, 100 100',
    viewBox: '0 0 200 200',
  },
];

// Dot patterns for join the dots
export interface DotPattern {
  id: string;
  name: string;
  dots: Array<{ x: number; y: number; id: number }>;
  correctOrder: number[];
}

export const DOT_PATTERNS: DotPattern[] = [
  {
    id: 'triangle',
    name: 'Triangle',
    dots: [
      { x: 100, y: 50, id: 1 },
      { x: 50, y: 150, id: 2 },
      { x: 150, y: 150, id: 3 },
    ],
    correctOrder: [1, 2, 3, 1],
  },
  {
    id: 'square',
    name: 'Square',
    dots: [
      { x: 50, y: 50, id: 1 },
      { x: 150, y: 50, id: 2 },
      { x: 150, y: 150, id: 3 },
      { x: 50, y: 150, id: 4 },
    ],
    correctOrder: [1, 2, 3, 4, 1],
  },
  {
    id: 'line',
    name: 'Line',
    dots: [
      { x: 50, y: 100, id: 1 },
      { x: 100, y: 100, id: 2 },
      { x: 150, y: 100, id: 3 },
    ],
    correctOrder: [1, 2, 3],
  },
];
