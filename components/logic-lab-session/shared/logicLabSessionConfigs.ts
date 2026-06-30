/** Per-session hub metadata for Logic Lab · Section 6 */
export type SessionCard = { icon: string; title: string; desc: string };

export type SessionPalette = {
  accent: string;
  glow: string;
  secondary: string;
};

export type LogicLabSessionConfig = {
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
  finale?: boolean;
};

export const LOGIC_LAB_SESSIONS: Record<number, LogicLabSessionConfig> = {
  1: {
    sessionNumber: 1,
    hubTitle: 'Position: IN',
    hubSubtitle: "Let's learn what IN means.",
    example: { emojis: '📦 ⚽', label: 'ball IN a box' },
    cards: [
      { icon: '📦', title: 'Find the correct position', desc: 'Where is the ball?' },
      { icon: '📥', title: 'Put objects IN', desc: 'Containers' },
      { icon: '🔷', title: 'Complete the pattern', desc: 'Pattern' },
      { icon: '🌱', title: 'Put steps in order', desc: 'Sequence' },
    ],
    resultTitle: 'Great job learning the word IN!',
    resultBadge: 'Logic Lab Beginner',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#6366F1', glow: '#A5B4FC', secondary: '#818CF8' },
  },
  2: {
    sessionNumber: 2,
    hubTitle: 'Position: ON',
    hubSubtitle: "Let's learn what ON means.",
    example: { emojis: '🪵 📖', label: 'book ON a table' },
    cards: [
      { icon: '🫙', title: 'Find the correct position', desc: 'Where is the cup?' },
      { icon: '🪑', title: 'Place objects ON surfaces', desc: 'Chair & table' },
      { icon: '🔶', title: 'Complete the pattern', desc: 'Pattern' },
      { icon: '🥪', title: 'Make a sandwich', desc: 'Sequence' },
    ],
    resultTitle: 'Great job learning the word ON!',
    resultBadge: 'ON Position Star',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#38BDF8', glow: '#7DD3FC', secondary: '#0EA5E9' },
  },
  3: {
    sessionNumber: 3,
    hubTitle: 'Position: UNDER',
    hubSubtitle: "Let's learn what UNDER means.",
    example: { emojis: '🪵 🐱', label: 'cat UNDER a table' },
    cards: [
      { icon: '🐱', title: 'Find the correct position', desc: 'Where is the cat?' },
      { icon: '🪑', title: 'Place objects UNDER', desc: 'Furniture' },
      { icon: '⭐', title: 'Complete the pattern', desc: 'Pattern' },
      { icon: '🌅', title: 'Morning routine', desc: 'Sequence' },
    ],
    resultTitle: 'Great job learning the word UNDER!',
    resultBadge: 'UNDER Position Star',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#7C3AED', glow: '#A78BFA', secondary: '#4C1D95' },
  },
  4: {
    sessionNumber: 4,
    hubTitle: 'Position: NEXT TO',
    hubSubtitle: "Let's learn what NEXT TO means.",
    example: { emojis: '🐕 👦', label: 'dog NEXT TO boy' },
    cards: [
      { icon: '🐕', title: 'Find the correct position', desc: 'Where is the dog?' },
      { icon: '🍽️', title: 'Place objects NEXT TO', desc: 'Plate & house' },
      { icon: '🟥', title: 'Complete the pattern', desc: 'Pattern' },
      { icon: '🧼', title: 'Wash your hands', desc: 'Sequence' },
    ],
    resultTitle: 'Great job learning the phrase NEXT TO!',
    resultBadge: 'NEXT TO Star',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#F97316', glow: '#FDBA74', secondary: '#34D399' },
  },
  5: {
    sessionNumber: 5,
    hubTitle: 'Position: BEHIND',
    hubSubtitle: "Let's learn what BEHIND means.",
    example: { emojis: '🌳 👦', label: 'boy BEHIND a tree' },
    cards: [
      { icon: '🌳', title: 'Find the correct position', desc: 'Where is the boy?' },
      { icon: '👦', title: 'Place character BEHIND', desc: 'Tree & house' },
      { icon: '🍎', title: 'Complete the pattern', desc: 'Fruit pattern' },
      { icon: '👟', title: 'Get ready to walk', desc: 'Sequence' },
    ],
    resultTitle: 'Great job learning the word BEHIND!',
    resultBadge: 'BEHIND Position Star',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#14532D', glow: '#4ADE80', secondary: '#166534' },
  },
  6: {
    sessionNumber: 6,
    hubTitle: 'Position: BETWEEN',
    hubSubtitle: "Let's learn what BETWEEN means.",
    example: { emojis: '🐕 🐱 🐕', label: 'cat BETWEEN two dogs' },
    cards: [
      { icon: '🐱', title: 'Find the correct position', desc: 'Where is the cat?' },
      { icon: '📦', title: 'Place object BETWEEN', desc: 'Trees & chairs' },
      { icon: '🔺', title: 'Complete the pattern', desc: 'Triangle & circle' },
      { icon: '🍚', title: 'Daily sequence', desc: 'Cook, eat, wash' },
    ],
    resultTitle: 'Great job learning the word BETWEEN!',
    resultBadge: 'BETWEEN Position Star',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#F472B6', glow: '#FBCFE8', secondary: '#8B5CF6' },
  },
  7: {
    sessionNumber: 7,
    hubTitle: 'Preposition Review',
    hubSubtitle: "Let's practice the positions we learned!",
    tags: ['IN', 'ON', 'UNDER', 'NEXT TO', 'BEHIND', 'BETWEEN'],
    cards: [
      { icon: '📍', title: 'Choose correct preposition', desc: 'Where is the object?' },
      { icon: '📦', title: 'Place objects correctly', desc: 'Ball, cup, cat' },
      { icon: '🔺', title: 'Complete the pattern', desc: 'Two patterns' },
      { icon: '🎒', title: 'Put the story in order', desc: 'Morning routine' },
    ],
    resultTitle: 'Great job practicing positions!',
    resultBadge: 'Preposition Explorer',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#FBBF24', glow: '#FDE68A', secondary: '#6366F1' },
  },
  8: {
    sessionNumber: 8,
    hubTitle: 'Pattern Builder',
    hubSubtitle: "Let's practice positions and build patterns.",
    cards: [
      { icon: '📝', title: 'Find the position word', desc: 'Complete the sentence' },
      { icon: '📦', title: 'Place the object correctly', desc: 'Ball, cup, cat' },
      { icon: '🔴', title: 'Build the pattern', desc: 'Complete the pattern' },
      { icon: '🪥', title: 'Put the actions in order', desc: 'Wash hands' },
    ],
    resultTitle: 'Great job building patterns!',
    resultBadge: 'Pattern Builder',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#14B8A6', glow: '#5EEAD4', secondary: '#EC4899' },
  },
  9: {
    sessionNumber: 9,
    hubTitle: 'Sequence Master',
    hubSubtitle: "Let's practice positions, patterns, and sequences.",
    cards: [
      { icon: '🐱', title: 'Find the correct position', desc: 'Which word fits?' },
      { icon: '📦', title: 'Place the object correctly', desc: 'Ball, cup, cat' },
      { icon: '🟦', title: 'Complete the pattern', desc: 'Blue and green' },
      { icon: '🎒', title: 'Arrange the daily routine', desc: '4 steps in order' },
    ],
    resultTitle: 'Great job arranging the sequence!',
    resultBadge: 'Sequence Master',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#F59E0B', glow: '#FDE68A', secondary: '#6366F1' },
  },
  10: {
    sessionNumber: 10,
    hubTitle: 'Logic Lab Master',
    hubSubtitle: 'Use everything you learned!',
    tags: ['prepositions', 'patterns', 'sequences'],
    cards: [
      { icon: '📍', title: 'Position Hunt', desc: 'Find IN, ON, UNDER' },
      { icon: '📝', title: 'Preposition Quiz', desc: 'Complete the sentence' },
      { icon: '🔴', title: 'Pattern Challenge', desc: 'Two patterns' },
      { icon: '🌱', title: 'Story sequence', desc: 'Plant to fruit' },
    ],
    resultTitle: 'Congratulations! You completed Level 6.',
    resultBadge: 'Logic Lab Master',
    resultBadgeEmoji: '🏆',
    palette: { accent: '#FBBF24', glow: '#FEF3C7', secondary: '#7C3AED' },
    finale: true,
  },
};
