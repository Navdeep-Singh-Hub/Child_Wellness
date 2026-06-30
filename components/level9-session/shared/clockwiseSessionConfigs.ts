/** Per-session hub metadata for The Clockwise · Section 9 */
export type SessionCard = { icon: string; title: string; desc: string };

export type SessionPalette = {
  accent: string;
  glow: string;
  secondary: string;
};

export type ClockwiseSessionConfig = {
  sessionNumber: number;
  hubTitle: string;
  hubSubtitle: string;
  cards: SessionCard[];
  example?: { emojis: string; label: string };
  tags?: string[];
  resultTitle: string;
  resultBadge: string;
  resultBadgeEmoji: string;
  resultTaskLabel?: string;
  palette: SessionPalette;
  finale?: boolean;
  finaleCelebrationTitle?: string;
  finaleCelebrationSubtitle?: string;
  unlockMessage?: string;
};

export const CLOCKWISE_SESSIONS: Record<number, ClockwiseSessionConfig> = {
  1: {
    sessionNumber: 1,
    hubTitle: 'Galaxy Gateway',
    hubSubtitle:
      'Advanced pattern, memory challenge, word BRIDGE, category logic — then a real-world photo task!',
    example: { emojis: '🔺 ⬜ ⭕', label: 'complete the shape pattern' },
    tags: ['Pattern', 'Memory', 'Words', 'Categories'],
    cards: [
      { icon: '🔺', title: 'Advanced Pattern', desc: 'Triangle, square, circle...' },
      { icon: '🎴', title: 'Memory Challenge', desc: 'Match 12 cards' },
      { icon: '🌉', title: 'Word Builder', desc: 'Build BRIDGE' },
      { icon: '🌱', title: 'Category Logic', desc: 'Living / Non-living' },
    ],
    resultTitle: 'Great job exploring the galaxy!',
    resultBadge: 'Pattern Pioneer',
    resultBadgeEmoji: '⭐',
    resultTaskLabel: 'Real-world task',
    palette: { accent: '#6366F1', glow: '#A5B4FC', secondary: '#818CF8' },
  },
  2: {
    sessionNumber: 2,
    hubTitle: 'Orbit Observatory',
    hubSubtitle:
      'Number pattern, spot 5 differences, shape rotation, bicycle assembly — then a real-world photo task!',
    example: { emojis: '2 6 10 14', label: 'find the next number (+4)' },
    tags: ['Numbers', 'Visual', 'Shapes', 'Assembly'],
    cards: [
      { icon: '🔢', title: 'Number Pattern', desc: '2, 6, 10, 14, ?' },
      { icon: '🔍', title: 'Spot the Difference', desc: 'Find 5 differences' },
      { icon: '⬠', title: 'Shape Rotation', desc: 'Select rotated pentagon' },
      { icon: '🚲', title: 'Build the Bicycle', desc: 'Drag pieces to assemble' },
    ],
    resultTitle: 'Great job navigating the orbit!',
    resultBadge: 'Pattern Navigator',
    resultBadgeEmoji: '⭐',
    resultTaskLabel: 'Real-world task',
    palette: { accent: '#0891B2', glow: '#67E8F9', secondary: '#22D3EE' },
  },
  3: {
    sessionNumber: 3,
    hubTitle: 'Mind Constellation',
    hubSubtitle:
      'Logical selection, memory grid, word ORANGE, pattern builder — then a real-world photo task!',
    example: { emojis: '🚗 🚌 🚂 🍌', label: 'find what does not belong' },
    tags: ['Logic', 'Memory', 'Words', 'Patterns'],
    cards: [
      { icon: '🧠', title: 'Logical Selection', desc: 'Car, bus, train, banana' },
      { icon: '🎴', title: 'Memory Grid', desc: 'Match 14 cards (7 pairs)' },
      { icon: '🍊', title: 'Word Builder', desc: 'Build ORANGE' },
      { icon: '🔺', title: 'Pattern Builder', desc: 'Circle, triangle, square...' },
    ],
    resultTitle: 'Great job thinking through the constellation!',
    resultBadge: 'Logic Navigator',
    resultBadgeEmoji: '⭐',
    resultTaskLabel: 'Real-world task',
    palette: { accent: '#7C3AED', glow: '#C4B5FD', secondary: '#A78BFA' },
  },
  4: {
    sessionNumber: 4,
    hubTitle: 'Star Forge',
    hubSubtitle:
      'Counting challenge, hexagon recognition, function matching, room sorting — then a real-world photo task!',
    example: { emojis: '⭐ ×18', label: 'count the stars' },
    tags: ['Counting', 'Shapes', 'Functions', 'Sorting'],
    cards: [
      { icon: '⭐', title: 'Counting Challenge', desc: 'Count 18 stars' },
      { icon: '⬡', title: 'Shape Recognition', desc: 'Select the hexagon' },
      { icon: '✂️', title: 'Function Matching', desc: 'Match tools with use' },
      { icon: '📂', title: 'Sorting Game', desc: 'Kitchen / Garden / Bedroom' },
    ],
    resultTitle: 'Great job forging through the stars!',
    resultBadge: 'Cosmic Counter',
    resultBadgeEmoji: '⭐',
    resultTaskLabel: 'Real-world task',
    palette: { accent: '#F59E0B', glow: '#FCD34D', secondary: '#FBBF24' },
  },
  5: {
    sessionNumber: 5,
    hubTitle: 'Cosmic Relay',
    hubSubtitle:
      'Color memory, number ladder, word HOUSE, bridge build — then stack three objects vertically!',
    example: { emojis: '🔴 🔵 🟢 🟡', label: 'repeat the color signal' },
    tags: ['Memory', 'Numbers', 'Words', 'Build'],
    cards: [
      { icon: '📡', title: 'Signal Echo', desc: 'Repeat the color sequence' },
      { icon: '🔢', title: 'Step Ladder', desc: '5, 10, 15, ?' },
      { icon: '🏠', title: 'Word Dock', desc: 'Build HOUSE' },
      { icon: '🌉', title: 'Span Forge', desc: 'Place bridge blocks' },
    ],
    resultTitle: 'Great job completing the relay!',
    resultBadge: 'Cosmic Engineer',
    resultBadgeEmoji: '🌉',
    resultTaskLabel: 'Real-world task',
    palette: { accent: '#EC4899', glow: '#FDA4AF', secondary: '#F472B6' },
  },
  6: {
    sessionNumber: 6,
    hubTitle: 'Vision Verge',
    hubSubtitle:
      'Visual puzzle, vehicle sorting, pattern logic, counting 20 — then a spatial photo task!',
    example: { emojis: '⭕ ⬜ 🔺', label: 'complete the shape grid' },
    tags: ['Puzzle', 'Sort', 'Pattern', 'Count'],
    cards: [
      { icon: '🧩', title: 'Fragment Forge', desc: 'Complete the missing piece' },
      { icon: '🚗', title: 'Vehicle Filter', desc: 'Select all vehicles' },
      { icon: '🔺', title: 'Pattern Relay', desc: 'Circle, circle, triangle…' },
      { icon: '⭐', title: 'Star Census', desc: 'Count 20 objects' },
    ],
    resultTitle: 'Great job crossing the vision verge!',
    resultBadge: 'Pattern Scout',
    resultBadgeEmoji: '🧩',
    resultTaskLabel: 'Real-world task',
    palette: { accent: '#10B981', glow: '#6EE7B7', secondary: '#34D399' },
  },
  7: {
    sessionNumber: 7,
    hubTitle: 'Feeling Frontier',
    hubSubtitle:
      'Emotion recognition, memory grid, word COMPUTER, tool matching — then a shapes photo task!',
    example: { emojis: '😕', label: 'tap the confused face' },
    tags: ['Emotion', 'Memory', 'Words', 'Match'],
    cards: [
      { icon: '😕', title: 'Confused Scan', desc: 'Tap the confused face' },
      { icon: '🎴', title: 'Deep Grid', desc: 'Match 16 cards (8 pairs)' },
      { icon: '💻', title: 'Word Dock', desc: 'Build COMPUTER' },
      { icon: '✂️', title: 'Tool Matrix', desc: 'Match tools with use' },
    ],
    resultTitle: 'Great job crossing the feeling frontier!',
    resultBadge: 'Emotion Voyager',
    resultBadgeEmoji: '😕',
    resultTaskLabel: 'Real-world task',
    palette: { accent: '#F43F5E', glow: '#FDA4AF', secondary: '#FB7185' },
  },
  8: {
    sessionNumber: 8,
    hubTitle: 'Pattern Foundry',
    hubSubtitle:
      'Color sequence, power ladder, shape forge, bot assembly — then five objects in a circle!',
    example: { emojis: '🔴 🔵 🟢 ↻', label: 'spot the repeating color pattern' },
    tags: ['Pattern', 'Numbers', 'Shapes', 'Build'],
    cards: [
      { icon: '🔴', title: 'Chromatic Pulse', desc: 'Red, blue, green, red, blue…' },
      { icon: '🔢', title: 'Power Ladder', desc: '3, 9, 27, ?' },
      { icon: '🧩', title: 'Shape Forge', desc: 'Fit shapes on the board' },
      { icon: '🤖', title: 'Bot Assembly', desc: 'Assemble robot pieces' },
    ],
    resultTitle: 'Foundry complete!',
    resultBadge: 'Pattern Smith',
    resultBadgeEmoji: '🤖',
    resultTaskLabel: 'Real-world task',
    palette: { accent: '#0EA5E9', glow: '#38BDF8', secondary: '#EF4444' },
  },
  9: {
    sessionNumber: 9,
    hubTitle: 'Anomaly Array',
    hubSubtitle:
      'Odd one out, memory grid, word HOSPITAL, pattern logic — then two objects the same size!',
    example: { emojis: '🥄 🍴 🔪 🪑', label: 'find what does not belong' },
    tags: ['Logic', 'Memory', 'Words', 'Pattern'],
    cards: [
      { icon: '🧠', title: 'Oddity Scan', desc: 'Spoon, fork, knife, chair' },
      { icon: '🎴', title: 'Deep Matrix', desc: 'Match 18 cards (9 pairs)' },
      { icon: '🏥', title: 'Word Dock', desc: 'Build HOSPITAL' },
      { icon: '🔺', title: 'Sequence Forge', desc: 'Square, triangle, circle…' },
    ],
    resultTitle: 'Array decoded!',
    resultBadge: 'Logic Navigator',
    resultBadgeEmoji: '🧠',
    resultTaskLabel: 'Real-world task',
    palette: { accent: '#7C3AED', glow: '#C4B5FD', secondary: '#2DD4BF' },
  },
  10: {
    sessionNumber: 10,
    hubTitle: 'Master Orbit',
    hubSubtitle:
      'Final mission! Fusion scan, apex matrix, word EDUCATION, logic forge — then stack a five-object tower!',
    example: { emojis: '🔺 🔵 ⭐×8', label: 'shape · color · count' },
    tags: ['Quiz', 'Memory', 'Words', 'Pattern'],
    cards: [
      { icon: '🎯', title: 'Fusion Scan', desc: 'Shapes, colors, numbers' },
      { icon: '🎴', title: 'Apex Matrix', desc: 'Match 20 cards (10 pairs)' },
      { icon: '📚', title: 'Word Dock', desc: 'Build EDUCATION' },
      { icon: '🔺', title: 'Logic Forge', desc: 'Triangle, square…' },
    ],
    resultTitle: 'Clockwise Master!',
    resultBadge: 'Galaxy Navigator',
    resultBadgeEmoji: '🏆',
    resultTaskLabel: 'Real-world task',
    palette: { accent: '#EAB308', glow: '#FDE047', secondary: '#A855F7' },
    finale: true,
    finaleCelebrationTitle: 'Level Complete!',
    finaleCelebrationSubtitle: 'Clockwise Master — Next level unlocked! 🎉',
    unlockMessage: 'Next level unlocked!',
  },
};
