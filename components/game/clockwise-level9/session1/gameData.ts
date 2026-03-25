// Game data for The Clockwise - Level 9 Session 1

export const STORY_SESSION1 = {
  passage: [
    'Sam has a red ball.',
    'Sam plays in the park.',
  ],
  fullText: 'Sam has a red ball. Sam plays in the park.',
  illustration: {
    emoji: '⚽',
    description: 'Boy with red ball in park',
  },
};

export const COMPREHENSION_QUESTION_SESSION1 = {
  question: 'What does Sam have?',
  options: [
    { answer: 'Ball', correct: true },
    { answer: 'Dog', correct: false },
    { answer: 'Book', correct: false },
  ],
};

export const CLOCK_TIME_SESSION1 = {
  time: '1:00',
  hour: 1,
  minute: 0,
  hourHandPosition: 1,
  minuteHandPosition: 12,
  description: 'When the big hand is at 12 and the small hand is at 1, the time is 1 o\'clock.',
};

export const CLOCK_OPTIONS_SESSION1 = [
  { time: '1:00', hour: 1, minute: 0, correct: true },
  { time: '3:00', hour: 3, minute: 0, correct: false },
  { time: '5:00', hour: 5, minute: 0, correct: false },
];

export const NOTEBOOK_SENTENCE_SESSION1 = 'Sam has a red ball.';
export const NOTEBOOK_CLOCK_TIME_SESSION1 = '1:00';
