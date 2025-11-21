export const SKILL_DEFINITIONS = [
  {
    id: 'color-recognition',
    title: 'Color Recognition',
    description: 'Identify and name colors when shown as tiles, pictures or quiz prompts.',
    tags: ['visual', 'language', 'quiz'],
    icon: '🎨',
  },
  {
    id: 'number-sense',
    title: 'Number Sense',
    description: 'Understand numbers, counting order and quantitative reasoning.',
    tags: ['numeracy', 'quiz'],
    icon: '🔢',
  },
  {
    id: 'animal-knowledge',
    title: 'Animal Knowledge',
    description: 'Recognize animals, their names and typical sounds/traits.',
    tags: ['language', 'quiz'],
    icon: '🐾',
  },
  {
    id: 'shape-awareness',
    title: 'Shape Awareness',
    description: 'Identify basic and advanced shapes across contexts.',
    tags: ['visual', 'spatial', 'quiz'],
    icon: '⬜',
  },
  {
    id: 'bird-knowledge',
    title: 'Bird Knowledge',
    description: 'Differentiate common birds and recall their names or characteristics.',
    tags: ['language', 'quiz'],
    icon: '🐦',
  },
  {
    id: 'aac-communication',
    title: 'AAC Communication',
    description: 'Compose phrases using AAC tiles and practice expressive language.',
    tags: ['aac', 'communication'],
    icon: '💬',
  },
  {
    id: 'emotion-identification',
    title: 'Emotion Identification',
    description: 'Recognize emotions from emoji tiles or scene prompts.',
    tags: ['social', 'emotional', 'games'],
    icon: '😊',
  },
  {
    id: 'category-sorting',
    title: 'Category Sorting',
    description: 'Sort vocabulary tiles into semantic or functional categories.',
    tags: ['cognitive', 'games'],
    icon: '🗂️',
  },
  {
    id: 'timing-control',
    title: 'Timing Control',
    description: 'Practice motor planning and impulse control through timing games.',
    tags: ['motor', 'games'],
    icon: '⏱️',
  },
];

export const SKILL_LOOKUP = SKILL_DEFINITIONS.reduce((acc, skill) => {
  acc[skill.id] = skill;
  return acc;
}, {});

