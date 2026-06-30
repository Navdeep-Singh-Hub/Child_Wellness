/** Per-session hub metadata for The Reader · Section 7 */
export type SessionCard = { icon: string; title: string; desc: string };

export type SessionPalette = {
  accent: string;
  glow: string;
  secondary: string;
};

export type ReaderSessionConfig = {
  sessionNumber: number;
  hubTitle: string;
  hubSubtitle: string;
  cards: SessionCard[];
  example?: { emojis: string; label: string };
  tags?: string[];
  resultTitle: string;
  resultBadge: string;
  resultBadgeEmoji: string;
  palette: SessionPalette;
  /** Final reader session — shows unlock celebration after real-world task success */
  isFinale?: boolean;
  unlockMessage?: string;
  finaleCelebrationTitle?: string;
  finaleCelebrationSubtitle?: string;
};

export const READER_SESSIONS: Record<number, ReaderSessionConfig> = {
  1: {
    sessionNumber: 1,
    hubTitle: 'Launch Pad',
    hubSubtitle: 'Patterns, memory, words, and sorting — then a real-world photo!',
    example: { emojis: '⬜ ⭕ 🔺', label: 'square · circle · triangle' },
    tags: ['Pattern', 'Memory', 'Words', 'Sort'],
    cards: [
      { icon: '🛰️', title: 'Orbit Weave', desc: 'Complete the shape sequence' },
      { icon: '✨', title: 'Star Grid', desc: 'Match 8 cards' },
      { icon: '🌳', title: 'Word Nebula', desc: 'Build TREE' },
      { icon: '🪐', title: 'Galaxy Sort', desc: 'Food · Animals · Vehicles' },
    ],
    resultTitle: 'Mission complete!',
    resultBadge: 'Reader Cadet',
    resultBadgeEmoji: '🚀',
    palette: { accent: '#8B5CF6', glow: '#C4B5FD', secondary: '#A78BFA' },
  },
  2: {
    sessionNumber: 2,
    hubTitle: 'Signal Station',
    hubSubtitle: 'Numbers, differences, shapes, and building — then a same-color photo!',
    example: { emojis: '3 · 6 · 9 · ?', label: 'count by threes' },
    tags: ['Numbers', 'Spot', 'Shapes', 'Build'],
    cards: [
      { icon: '☄️', title: 'Count Comet', desc: '3, 6, 9, ?' },
      { icon: '🔭', title: 'Scanner Scope', desc: 'Find 4 differences' },
      { icon: '⬠', title: 'Shape Sector', desc: 'Tap the pentagon' },
      { icon: '🛸', title: 'Rover Build', desc: 'Assemble the bicycle' },
    ],
    resultTitle: 'Signal locked in!',
    resultBadge: 'Star Navigator',
    resultBadgeEmoji: '🛰️',
    palette: { accent: '#06B6D4', glow: '#67E8F9', secondary: '#22D3EE' },
  },
  3: {
    sessionNumber: 3,
    hubTitle: 'Mind Nebula',
    hubSubtitle: 'Logic, memory, words, and patterns — then a square-layout photo!',
    example: { emojis: '🐕 🐱 🚗', label: 'find the odd one out' },
    tags: ['Logic', 'Memory', 'Words', 'Pattern'],
    cards: [
      { icon: '🧠', title: 'Logic Lock', desc: 'Find what does NOT belong' },
      { icon: '🌌', title: 'Deep Grid', desc: 'Match 10 cards' },
      { icon: '🍎', title: 'Word Nova', desc: 'Build APPLE' },
      { icon: '🔷', title: 'Pattern Pulse', desc: 'Triangle, square, ?' },
    ],
    resultTitle: 'Mind nebula mastered!',
    resultBadge: 'Logic Voyager',
    resultBadgeEmoji: '🧠',
    palette: { accent: '#A855F7', glow: '#D8B4FE', secondary: '#EC4899' },
  },
  4: {
    sessionNumber: 4,
    hubTitle: 'Star Harbor',
    hubSubtitle: 'Counting, shapes, uses, and sorting — then a round & square photo!',
    example: { emojis: '⭐ × 12', label: 'count the stars' },
    tags: ['Count', 'Shapes', 'Function', 'Sort'],
    cards: [
      { icon: '✨', title: 'Star Census', desc: 'Count 12 stars' },
      { icon: '▭', title: 'Spin Sector', desc: 'Find the rotated rectangle' },
      { icon: '🔧', title: 'Use Matrix', desc: 'Match object to its use' },
      { icon: '🏠', title: 'Zone Sort', desc: 'Indoor · Outdoor' },
    ],
    resultTitle: 'Harbor cleared!',
    resultBadge: 'Star Analyst',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#F59E0B', glow: '#FCD34D', secondary: '#FBBF24' },
  },
  5: {
    sessionNumber: 5,
    hubTitle: 'Cosmic Relay',
    hubSubtitle: 'Memory, numbers, words, and building — then stack three objects vertically!',
    example: { emojis: '🔴 🔵 🟢 🟡', label: 'repeat the color signal' },
    tags: ['Memory', 'Numbers', 'Words', 'Build'],
    cards: [
      { icon: '📡', title: 'Pulse Echo', desc: 'Repeat the color signal' },
      { icon: '🔢', title: 'Step Ladder', desc: '5, 10, 15, ?' },
      { icon: '🏠', title: 'Word Dock', desc: 'Build HOUSE' },
      { icon: '🌉', title: 'Span Forge', desc: 'Place bridge blocks' },
    ],
    resultTitle: 'Relay complete!',
    resultBadge: 'Cosmic Engineer',
    resultBadgeEmoji: '🌉',
    palette: { accent: '#6366F1', glow: '#A5B4FC', secondary: '#818CF8' },
  },
  6: {
    sessionNumber: 6,
    hubTitle: 'Vision Verge',
    hubSubtitle: 'Puzzles, animals, patterns, and counting — then a spatial photo task!',
    example: { emojis: '◐ + ?', label: 'complete the picture' },
    tags: ['Puzzle', 'Sort', 'Pattern', 'Count'],
    cards: [
      { icon: '🧩', title: 'Fragment Forge', desc: 'Complete the half shape' },
      { icon: '🐾', title: 'Creature Filter', desc: 'Select all animals' },
      { icon: '⬜', title: 'Pattern Relay', desc: 'Circle, circle, square…' },
      { icon: '🔵', title: 'Dot Census', desc: 'Count 15 dots' },
    ],
    resultTitle: 'Vision verge cleared!',
    resultBadge: 'Pattern Scout',
    resultBadgeEmoji: '🧩',
    palette: { accent: '#10B981', glow: '#6EE7B7', secondary: '#34D399' },
  },
  7: {
    sessionNumber: 7,
    hubTitle: 'Feeling Frontier',
    hubSubtitle: 'Emotions, memory, words, and matching — then three different sizes!',
    example: { emojis: '😲', label: 'find the surprised face' },
    tags: ['Emotion', 'Memory', 'Words', 'Match'],
    cards: [
      { icon: '😲', title: 'Surprise Scan', desc: 'Tap the surprised face' },
      { icon: '🎴', title: 'Deep Grid', desc: 'Match 12 cards (6 pairs)' },
      { icon: '🪑', title: 'Word Dock', desc: 'Build CHAIR' },
      { icon: '✂️', title: 'Tool Matrix', desc: 'Match tool with its use' },
    ],
    resultTitle: 'Frontier crossed!',
    resultBadge: 'Emotion Voyager',
    resultBadgeEmoji: '😲',
    palette: { accent: '#F43F5E', glow: '#FDA4AF', secondary: '#FB7185' },
  },
  8: {
    sessionNumber: 8,
    hubTitle: 'Pattern Foundry',
    hubSubtitle: 'Colors, numbers, shapes, and building — then a triangle photo!',
    example: { emojis: '🔴 🔵 🔴 ?', label: 'spot the color pattern' },
    tags: ['Pattern', 'Numbers', 'Shapes', 'Build'],
    cards: [
      { icon: '🔴', title: 'Chromatic Pulse', desc: 'Red, blue, red, blue…' },
      { icon: '🔢', title: 'Power Ladder', desc: '2, 4, 8, ?' },
      { icon: '🧩', title: 'Shape Forge', desc: 'Fit shapes on the board' },
      { icon: '🤖', title: 'Bot Assembly', desc: 'Assemble robot pieces' },
    ],
    resultTitle: 'Foundry complete!',
    resultBadge: 'Pattern Smith',
    resultBadgeEmoji: '🤖',
    palette: { accent: '#0EA5E9', glow: '#38BDF8', secondary: '#EF4444' },
  },
  9: {
    sessionNumber: 9,
    hubTitle: 'Anomaly Array',
    hubSubtitle: 'Logic, memory, words, and patterns — then two different colors!',
    example: { emojis: '🚗 🚌 🍎 🚂', label: 'find the odd one out' },
    tags: ['Logic', 'Memory', 'Words', 'Pattern'],
    cards: [
      { icon: '🧠', title: 'Oddity Scan', desc: 'Car, bus, apple, train' },
      { icon: '🎴', title: 'Deep Matrix', desc: 'Match 14 cards (7 pairs)' },
      { icon: '🪑', title: 'Word Dock', desc: 'Build TABLE' },
      { icon: '🔺', title: 'Sequence Forge', desc: 'Triangle, circle, square…' },
    ],
    resultTitle: 'Array decoded!',
    resultBadge: 'Logic Navigator',
    resultBadgeEmoji: '🧠',
    palette: { accent: '#7C3AED', glow: '#C4B5FD', secondary: '#2DD4BF' },
  },
  10: {
    sessionNumber: 10,
    hubTitle: 'Master Orbit',
    hubSubtitle: 'Final mission! Quiz, memory, words, and patterns — then stack a four-object tower!',
    example: { emojis: '⭕ 🔴 ⭐×6', label: 'shape · color · count' },
    tags: ['Quiz', 'Memory', 'Words', 'Pattern'],
    cards: [
      { icon: '🎯', title: 'Fusion Scan', desc: 'Shapes, colors, numbers' },
      { icon: '🎴', title: 'Apex Matrix', desc: 'Match 16 cards (8 pairs)' },
      { icon: '🏫', title: 'Word Dock', desc: 'Build SCHOOL' },
      { icon: '⬜', title: 'Logic Forge', desc: 'Square, triangle…' },
    ],
    resultTitle: 'Reader Master!',
    resultBadge: 'Galaxy Reader',
    resultBadgeEmoji: '🏆',
    palette: { accent: '#EAB308', glow: '#FDE047', secondary: '#A855F7' },
    isFinale: true,
    unlockMessage: 'Next level unlocked!',
    finaleCelebrationTitle: 'Level Complete!',
    finaleCelebrationSubtitle: 'Reader Master — Next level unlocked! 🎉',
  },
};
