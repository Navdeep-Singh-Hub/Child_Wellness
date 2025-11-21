export type SkillId =
  | 'color-recognition'
  | 'number-sense'
  | 'animal-knowledge'
  | 'shape-awareness'
  | 'bird-knowledge'
  | 'aac-communication'
  | 'emotion-identification'
  | 'category-sorting'
  | 'timing-control';

export type SkillDefinition = {
  id: SkillId;
  title: string;
  description: string;
  tags: string[];
  icon: string;
};

export const SKILLS: SkillDefinition[] = [
  {
    id: 'color-recognition',
    title: 'Color Recognition',
    description: 'Identify and name colors during quizzes, AAC use, or picture games.',
    tags: ['visual', 'language', 'quiz'],
    icon: '🎨',
  },
  {
    id: 'number-sense',
    title: 'Number Sense',
    description: 'Understand counting order, digit identification, and quantitative reasoning.',
    tags: ['numeracy', 'quiz'],
    icon: '🔢',
  },
  {
    id: 'animal-knowledge',
    title: 'Animal Knowledge',
    description: 'Recognize animals, their names, sounds, and classifications.',
    tags: ['language', 'quiz'],
    icon: '🐾',
  },
  {
    id: 'shape-awareness',
    title: 'Shape Awareness',
    description: 'Differentiate shapes and reason about spatial relationships.',
    tags: ['visual', 'spatial', 'quiz'],
    icon: '⬜',
  },
  {
    id: 'bird-knowledge',
    title: 'Bird Knowledge',
    description: 'Identify bird species and recall defining features or sounds.',
    tags: ['language', 'quiz'],
    icon: '🐦',
  },
  {
    id: 'aac-communication',
    title: 'AAC Communication',
    description: 'Compose expressive phrases using AAC tiles and core vocabulary.',
    tags: ['aac', 'communication'],
    icon: '💬',
  },
  {
    id: 'emotion-identification',
    title: 'Emotion Identification',
    description: 'Recognize emotions from emoji tiles, faces, or smart explorer scenes.',
    tags: ['social', 'emotional', 'games'],
    icon: '😊',
  },
  {
    id: 'category-sorting',
    title: 'Category Sorting',
    description: 'Place vocabulary tiles into semantic categories quickly.',
    tags: ['cognitive', 'games'],
    icon: '🗂️',
  },
  {
    id: 'timing-control',
    title: 'Timing Control',
    description: 'Practice motor planning and self-control through timing mini-games.',
    tags: ['motor', 'games'],
    icon: '⏱️',
  },
];

export const SKILL_LOOKUP: Record<SkillId, SkillDefinition> = SKILLS.reduce(
  (acc, skill) => {
    acc[skill.id] = skill;
    return acc;
  },
  {} as Record<SkillId, SkillDefinition>,
);

