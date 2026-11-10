import { AGE_GROUPS } from '@/components/ChildForm';

export type LearningItem = {
  id: string;
  kind: 'Video' | 'Activity';
  title: string;
  ageGroup: (typeof AGE_GROUPS)[number];
  minutes: number;
  skill: string;
  image: string;
  description: string;
  materials: string[];
};

export const LEARNING_ITEMS: LearningItem[] = [
  {
    id: 'tummy-time',
    kind: 'Video',
    title: 'Tummy time for newborns',
    ageGroup: '0-6 months',
    minutes: 5,
    skill: 'Motor skills',
    image: 'https://images.pexels.com/photos/7491185/pexels-photo-7491185.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Short, safe tummy time sessions that build neck and shoulder strength.',
    materials: ['Soft play mat', 'A small mirror'],
  },
  {
    id: 'high-contrast',
    kind: 'Activity',
    title: 'Black and white visual play',
    ageGroup: '0-6 months',
    minutes: 6,
    skill: 'Vision',
    image: 'https://images.pexels.com/photos/6849274/pexels-photo-6849274.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'High-contrast cards and hanging toys help newborns focus and track movement.',
    materials: ['Black and white cards', 'Hanging playmat toys'],
  },
  {
    id: 'soothing-sounds',
    kind: 'Video',
    title: 'Soothing sounds and rhythm',
    ageGroup: '0-6 months',
    minutes: 8,
    skill: 'Hearing',
    image: 'https://images.pexels.com/photos/3875222/pexels-photo-3875222.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Gentle songs and sound games that support listening and calm bonding time.',
    materials: ['Rattle or a soft bell'],
  },
  {
    id: 'peekaboo',
    kind: 'Video',
    title: 'Peek-a-boo and object play',
    ageGroup: '6-12 months',
    minutes: 6,
    skill: 'Cognition',
    image: 'https://images.pexels.com/photos/13030808/pexels-photo-13030808.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Hide and reveal games teach object permanence, one of the first big thinking skills.',
    materials: ['A light cloth', 'Two favourite toys'],
  },
  {
    id: 'texture-box',
    kind: 'Activity',
    title: 'Sensory texture box',
    ageGroup: '6-12 months',
    minutes: 12,
    skill: 'Sensory',
    image: 'https://images.pexels.com/photos/38679841/pexels-photo-38679841.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Let your baby explore soft, bumpy and smooth materials under close supervision.',
    materials: ['Shallow box', 'Soft fabrics', 'Large wooden spoon'],
  },
  {
    id: 'cup-stacking',
    kind: 'Activity',
    title: 'Stacking and knocking down',
    ageGroup: '6-12 months',
    minutes: 10,
    skill: 'Coordination',
    image: 'https://images.pexels.com/photos/7117502/pexels-photo-7117502.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Simple stacking and knocking games that grow hand-eye coordination.',
    materials: ['Soft blocks or cups'],
  },
  {
    id: 'shape-sorting',
    kind: 'Activity',
    title: 'Shape sorting fun',
    ageGroup: '1-2 years',
    minutes: 10,
    skill: 'Problem solving',
    image: 'https://images.pexels.com/photos/16145654/pexels-photo-16145654.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Match shapes to the right holes and name each one out loud.',
    materials: ['Shape sorter box'],
  },
  {
    id: 'first-words',
    kind: 'Video',
    title: 'First words with picture cards',
    ageGroup: '1-2 years',
    minutes: 9,
    skill: 'Language',
    image: 'https://images.pexels.com/photos/5435599/pexels-photo-5435599.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Name everyday objects and encourage your toddler to repeat them.',
    materials: ['Picture cards of familiar objects'],
  },
  {
    id: 'block-tower',
    kind: 'Activity',
    title: 'Build a tower together',
    ageGroup: '1-2 years',
    minutes: 12,
    skill: 'Creativity',
    image: 'https://images.pexels.com/photos/7301166/pexels-photo-7301166.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Stack wooden blocks, then knock the tower down and start again.',
    materials: ['Wooden blocks'],
  },
  {
    id: 'colour-painting',
    kind: 'Activity',
    title: 'Colour painting basics',
    ageGroup: '2-4 years',
    minutes: 15,
    skill: 'Creativity',
    image: 'https://images.pexels.com/photos/8612988/pexels-photo-8612988.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Finger painting and colour naming with washable, non-toxic paints.',
    materials: ['Washable paints', 'Thick paper', 'Smock'],
  },
  {
    id: 'counting-blocks',
    kind: 'Video',
    title: 'Counting with blocks',
    ageGroup: '2-4 years',
    minutes: 8,
    skill: 'Maths',
    image: 'https://images.pexels.com/photos/12940817/pexels-photo-12940817.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Count, sort and compare groups of blocks with a fun, sing-along rhythm.',
    materials: ['Wooden blocks'],
  },
  {
    id: 'rainbow-art',
    kind: 'Activity',
    title: 'Watercolour rainbow',
    ageGroup: '4-7 years',
    minutes: 20,
    skill: 'Art',
    image: 'https://images.pexels.com/photos/12585861/pexels-photo-12585861.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Blend colours on wet paper and talk about how the rainbow forms.',
    materials: ['Watercolour set', 'Thick paper'],
  },
  {
    id: 'story-imagination',
    kind: 'Video',
    title: 'Story time and imagination',
    ageGroup: '4-7 years',
    minutes: 14,
    skill: 'Language',
    image: 'https://images.pexels.com/photos/8363769/pexels-photo-8363769.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Guided storytelling that invites your child to invent endings and characters.',
    materials: ['Any picture book'],
  },
];

export function getLearningItem(id: string) {
  return LEARNING_ITEMS.find((item) => item.id === id);
}
