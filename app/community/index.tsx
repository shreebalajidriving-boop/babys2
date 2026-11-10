import { router } from 'expo-router';
import { Heart, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { COMMUNITY_TOPICS, displayLikes, SEED_POSTS, timeAgo, topicLabel } from '@/lib/community';
import { FONT, type Palette } from '@/lib/theme';
import type { CommunityPost, CommunityTopic } from '@/lib/types';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';

const TOPIC_FILTERS: { value: 'all' | CommunityTopic; label: string }[] = [{ value: 'all', label: 'All' }, ...COMMUNITY_TOPICS];

export default function CommunityScreen() {
  const { theme, communityPosts, likedPostIds, toggleCommunityLike } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [topic, setTopic] = useState<'all' | CommunityTopic>('all');
  const now = Date.now();

  const posts = useMemo(
    () =>
      [...communityPosts, ...SEED_POSTS]
        .filter((post) => topic === 'all' || post.topic === topic)
        .sort((a, b) => b.createdAt - a.createdAt),
    [communityPosts, topic],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Community" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Questions and tips from parents, grouped by what is on your mind.</Text>

        <PrimaryButton label="Write a post" onPress={() => router.navigate('/community/new')} />

        <FilterChips options={TOPIC_FILTERS} value={topic} onChange={setTopic} />

        {posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            message="Be the first to share something on this topic."
            actionLabel="Show all"
            onAction={() => setTopic('all')}
          />
        ) : (
          <View style={styles.list}>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                liked={likedPostIds.includes(post.id)}
                now={now}
                styles={styles}
                theme={theme}
                onToggleLike={() => toggleCommunityLike(post.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PostCard({
  post,
  liked,
  now,
  styles,
  theme,
  onToggleLike,
}: {
  post: CommunityPost;
  liked: boolean;
  now: number;
  styles: ReturnType<typeof makeStyles>;
  theme: Palette;
  onToggleLike: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.topicPill}>
          <Text style={styles.topicText}>{topicLabel(post.topic)}</Text>
        </View>
        <Text style={styles.meta}>{timeAgo(post.createdAt, now)}</Text>
      </View>
      <Text style={styles.postText}>{post.text}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.author}>{post.authorName}</Text>
        <Pressable
          onPress={onToggleLike}
          style={styles.likeButton}
          accessibilityRole="button"
          accessibilityState={{ selected: liked }}
          accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
        >
          <Heart size={16} color={liked ? theme.strong : theme.muted} fill={liked ? theme.strong : 'transparent'} />
          <Text style={[styles.likeCount, liked && styles.likeCountActive]}>{displayLikes(post, liked)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
    intro: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, lineHeight: 21 },
    list: { gap: 12 },
    card: {
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      gap: 10,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    topicPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: t.secondary },
    topicText: { fontFamily: FONT.bold, fontSize: 12, color: t.strong },
    meta: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    postText: { fontFamily: FONT.regular, fontSize: 15, color: t.ink, lineHeight: 22 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    author: { fontFamily: FONT.semibold, fontSize: 13, color: t.muted },
    likeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.border,
    },
    likeCount: { fontFamily: FONT.semibold, fontSize: 13, color: t.muted },
    likeCountActive: { color: t.strong },
  });
}
