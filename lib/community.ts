import type { CommunityPost, CommunityTopic } from '@/lib/types';

export const COMMUNITY_TOPICS: { value: CommunityTopic; label: string }[] = [
  { value: 'sleep', label: 'Sleep' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'milestones', label: 'Milestones' },
  { value: 'health', label: 'Health' },
  { value: 'meetups', label: 'Meetups' },
];

export const POST_MAX_LENGTH = 280;

export const SEED_POSTS: CommunityPost[] = [
  {
    id: 'seed-sleep-1',
    createdAt: Date.parse('2026-02-10T08:30:00+05:30'),
    topic: 'sleep',
    authorName: 'Meera K.',
    text: 'Our 5-month-old finally did a 6-hour stretch last night. A dark room, white noise and the same lullaby every time made the difference. Hang in there, it does get better.',
    likes: 24,
  },
  {
    id: 'seed-feeding-1',
    createdAt: Date.parse('2026-02-12T19:15:00+05:30'),
    topic: 'feeding',
    authorName: 'Ritu S.',
    text: 'Starting solids with ragi porridge this week. Tip: introduce one new food every three days so you can spot any reaction easily.',
    likes: 41,
  },
  {
    id: 'seed-milestones-1',
    createdAt: Date.parse('2026-02-14T10:00:00+05:30'),
    topic: 'milestones',
    authorName: 'Arjun P.',
    text: 'My son said his first real word today: "ball". Every milestone feels huge when it is your first. What did yours say first?',
    likes: 18,
  },
  {
    id: 'seed-health-1',
    createdAt: Date.parse('2026-02-16T21:40:00+05:30'),
    topic: 'health',
    authorName: 'Fatima A.',
    text: 'Reminder to keep a simple log of your baby’s temperature readings and feeds when they are unwell. It made the doctor visit so much quicker.',
    likes: 33,
  },
  {
    id: 'seed-meetups-1',
    createdAt: Date.parse('2026-02-18T16:00:00+05:30'),
    topic: 'meetups',
    authorName: 'Karan D.',
    text: 'Weekend park meetup for parents with toddlers around 2 years old. Bring snacks and a ball. Let me know if you would like to join.',
    likes: 12,
  },
];

export function displayLikes(post: CommunityPost, liked: boolean) {
  return post.likes + (liked ? 1 : 0);
}

export function timeAgo(timestamp: number, now: number) {
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60_000));
  if (minutes < 60) return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function topicLabel(topic: CommunityTopic) {
  return COMMUNITY_TOPICS.find((t) => t.value === topic)?.label ?? topic;
}
