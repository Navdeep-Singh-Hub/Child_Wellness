/** Per-session hub metadata for The Graduate · Section 10 */
export type SessionCard = { icon: string; title: string; desc: string };

export type SessionPalette = {
  accent: string;
  glow: string;
  secondary: string;
};

export type GraduateSessionConfig = {
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

export const GRADUATE_SESSIONS: Record<number, GraduateSessionConfig> = {
  1: {
    sessionNumber: 1,
    hubTitle: 'Conversation Café',
    hubSubtitle: 'Practice talking, replying, and solving little stories!',
    example: { emojis: '💬 Hello!', label: 'finish the conversation' },
    tags: ['Dialogue', 'Replies', 'Stories', 'Patterns'],
    cards: [
      { icon: '💬', title: 'Dialogue Complete', desc: 'Choose the reply' },
      { icon: '💬', title: 'Reply Choice', desc: 'How are you?' },
      { icon: '📖', title: 'Story Problem', desc: 'Riya + apples' },
      { icon: '🔢', title: 'Pattern Puzzle', desc: '🍎 🍌 🍎 🍌' },
    ],
    resultTitle: 'Great job starting a conversation!',
    resultBadge: 'Conversation Starter',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#6366F1', glow: '#A5B4FC', secondary: '#8B5CF6' },
  },
  2: {
    sessionNumber: 2,
    hubTitle: 'Story Studio',
    hubSubtitle: "Let's arrange sentences and solve story problems.",
    example: { emojis: '☀️ 🪥 🎒', label: 'put actions in order' },
    tags: ['Sequence', 'Replies', 'Stories', 'Patterns'],
    cards: [
      { icon: '📖', title: 'Sentence Arrange', desc: 'Wake up → school' },
      { icon: '💬', title: 'Dialogue Choice', desc: 'Teacher: Sit down' },
      { icon: '🐦', title: 'Story Problem', desc: '3 birds + 2 more' },
      { icon: '🔢', title: 'Pattern Puzzle', desc: '🔺 🔵 🔺 🔵' },
    ],
    resultTitle: 'Great job arranging story sentences!',
    resultBadge: 'Story Builder',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#7C3AED', glow: '#C4B5FD', secondary: '#A78BFA' },
  },
  3: {
    sessionNumber: 3,
    hubTitle: 'Answer Lab',
    hubSubtitle: "Let's answer questions and solve simple problems.",
    example: { emojis: '❓ 💧', label: 'what do we drink?' },
    tags: ['Questions', 'Dialogue', 'Subtraction', 'Sorting'],
    cards: [
      { icon: '❓', title: 'Question Choice', desc: 'What do we drink?' },
      { icon: '💬', title: 'Dialogue Complete', desc: 'Mom: Eat your food' },
      { icon: '🍬', title: 'Story Problem', desc: '5 candies − 2' },
      { icon: '📂', title: 'Logic Sorting', desc: 'Food or Animals?' },
    ],
    resultTitle: 'Great job answering questions!',
    resultBadge: 'Question Solver',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#0EA5E9', glow: '#7DD3FC', secondary: '#38BDF8' },
  },
  4: {
    sessionNumber: 4,
    hubTitle: 'Daily Story Loft',
    hubSubtitle: "Let's understand stories and solve problems.",
    example: { emojis: '🪥 📖', label: 'match picture to sentence' },
    tags: ['Picture story', 'Dialogue', 'Subtraction', 'Sequence'],
    cards: [
      { icon: '📖', title: 'Picture Sentence', desc: 'Brush teeth scene' },
      { icon: '💬', title: 'Dialogue Complete', desc: "Friend: Let's play" },
      { icon: '🎈', title: 'Story Problem', desc: '4 balloons − 1' },
      { icon: '🔢', title: 'Logic Sequence', desc: '☀️ 🌙 ☀️ 🌙' },
    ],
    resultTitle: 'Great job understanding daily stories!',
    resultBadge: 'Story Explorer',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#F59E0B', glow: '#FDE68A', secondary: '#FBBF24' },
  },
  5: {
    sessionNumber: 5,
    hubTitle: 'Social Circle',
    hubSubtitle: "Let's practice greetings and polite conversations.",
    example: { emojis: '👋 ☀️', label: 'say good morning' },
    tags: ['Greetings', 'Polite replies', 'Addition', 'Patterns'],
    cards: [
      { icon: '👋', title: 'Greeting Choice', desc: 'Good morning?' },
      { icon: '💬', title: 'Dialogue Match', desc: 'Thank you → Welcome' },
      { icon: '🐕', title: 'Story Problem', desc: '2 dogs + 2 more' },
      { icon: '🔢', title: 'Pattern Puzzle', desc: '🟥 🟩 🟥 🟩' },
    ],
    resultTitle: 'Great job practicing social dialogue!',
    resultBadge: 'Social Communicator',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#10B981', glow: '#6EE7B7', secondary: '#34D399' },
  },
  6: {
    sessionNumber: 6,
    hubTitle: 'Story Gallery',
    hubSubtitle: "Let's read stories and solve problems.",
    example: { emojis: '👦 ⚽', label: 'who has the ball?' },
    tags: ['Story picture', 'Dialogue', 'Subtraction', 'Size sort'],
    cards: [
      { icon: '📖', title: 'Story Question', desc: 'Who has the ball?' },
      { icon: '💬', title: 'Dialogue Match', desc: 'Sit down → Okay' },
      { icon: '🍪', title: 'Story Problem', desc: '10 cookies − 3' },
      { icon: '📐', title: 'Size Sort', desc: 'Small, Medium, Large' },
    ],
    resultTitle: 'Great job understanding the story!',
    resultBadge: 'Story Thinker',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#EC4899', glow: '#F9A8D4', secondary: '#F472B6' },
  },
  7: {
    sessionNumber: 7,
    hubTitle: 'Problem Workshop',
    hubSubtitle: "Let's solve problems from everyday life.",
    example: { emojis: '✏️ 📚', label: 'what does the child have?' },
    tags: ['Story', 'Conversation', 'Addition', 'Patterns'],
    cards: [
      { icon: '📖', title: 'Story Comprehension', desc: 'What does the child have?' },
      { icon: '💬', title: 'Finish Conversation', desc: 'Can I borrow a pencil?' },
      { icon: '✏️', title: 'Story Problem', desc: '7 pencils + 2 more' },
      { icon: '🔢', title: 'Pattern Puzzle', desc: '🟦 🟩 🟦 🟩' },
    ],
    resultTitle: 'Great job solving real-life problems!',
    resultBadge: 'Problem Solver',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#14B8A6', glow: '#5EEAD4', secondary: '#2DD4BF' },
  },
  8: {
    sessionNumber: 8,
    hubTitle: 'Dialogue Studio',
    hubSubtitle: "Let's build conversations and solve problems.",
    example: { emojis: '💬 👋', label: 'put hello in order' },
    tags: ['Arrange dialogue', 'Replies', 'Addition', 'Sequence'],
    cards: [
      { icon: '💬', title: 'Dialogue Arrange', desc: 'Hello → How are you?' },
      { icon: '💬', title: 'Reply Choice', desc: 'Do you want to play?' },
      { icon: '🍎', title: 'Story Problem', desc: '5 apples + 5 more' },
      { icon: '🔢', title: 'Logic Sequence', desc: '⭐ 🔵 ⭐ 🔵' },
    ],
    resultTitle: 'Great job building conversations!',
    resultBadge: 'Dialogue Builder',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#2563EB', glow: '#93C5FD', secondary: '#3B82F6' },
  },
  9: {
    sessionNumber: 9,
    hubTitle: 'Story Problem Lab',
    hubSubtitle: "Let's read stories and solve problems.",
    example: { emojis: '👧 ⚽', label: 'what does Riya have?' },
    tags: ['Story reading', 'Dialogue', 'Subtraction', 'Logic'],
    cards: [
      { icon: '📖', title: 'Story Reading', desc: 'What does Riya have?' },
      { icon: '💬', title: 'Finish Conversation', desc: 'Can you help me?' },
      { icon: '🍬', title: 'Story Problem', desc: '8 candies − 3' },
      { icon: '🔢', title: 'Logic Puzzle', desc: '🍎 🍌 pattern' },
    ],
    resultTitle: 'Great job solving story problems!',
    resultBadge: 'Story Problem Solver',
    resultBadgeEmoji: '⭐',
    palette: { accent: '#EA580C', glow: '#FDBA74', secondary: '#FB923C' },
  },
  10: {
    sessionNumber: 10,
    hubTitle: 'Graduate Master',
    hubSubtitle: 'Use everything you learned to complete the final challenge!',
    example: { emojis: '🌳 👫 🏠', label: 'arrange the park story' },
    tags: ['Story building', 'Dialogue', 'Word problems', 'Logic'],
    cards: [
      { icon: '📖', title: 'Arrange the story', desc: 'Park, friend, home' },
      { icon: '💬', title: 'Answer the conversation', desc: 'Hello! Please sit down.' },
      { icon: '🍎', title: 'Solve the story', desc: 'Riya: 4 apples + 3 more' },
      { icon: '🔢', title: 'Complete the pattern', desc: '🔺 🔵 🔺 🔵 🔺 __' },
    ],
    resultTitle: 'Congratulations! You completed the learning journey!',
    resultBadge: 'Graduate Master',
    resultBadgeEmoji: '🏆',
    palette: { accent: '#4F46E5', glow: '#FCD34D', secondary: '#818CF8' },
    finale: true,
  },
};
