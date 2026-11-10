import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { COMMUNITY_TOPICS, POST_MAX_LENGTH } from '@/lib/community';
import { FONT, type Palette } from '@/lib/theme';
import type { CommunityTopic } from '@/lib/types';
import { FilterChips } from '@/components/FilterChips';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/Toast';

export default function NewPostScreen() {
  const { theme, parent, addCommunityPost } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const showToast = useToast();
  const [topic, setTopic] = useState<CommunityTopic>('sleep');
  const [authorName, setAuthorName] = useState(parent?.name ?? '');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const name = authorName.trim();
    const message = text.trim();
    if (!name) {
      setError('Add a name so other parents know who is posting.');
      return;
    }
    if (!message) {
      setError('Write something before sharing.');
      return;
    }
    addCommunityPost({ topic, text: message, authorName: name });
    showToast('Your post is live in the community');
    router.replace('/community');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="New post" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.label}>Topic</Text>
          <FilterChips options={COMMUNITY_TOPICS} value={topic} onChange={setTopic} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Shown as</Text>
          <TextInput
            value={authorName}
            onChangeText={(value) => {
              setAuthorName(value);
              setError(null);
            }}
            maxLength={40}
            placeholder="Your first name and initial"
            placeholderTextColor={theme.muted}
            style={styles.input}
            accessibilityLabel="Name shown on your post"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Your post</Text>
          <TextInput
            value={text}
            onChangeText={(value) => {
              setText(value);
              setError(null);
            }}
            maxLength={POST_MAX_LENGTH}
            multiline
            placeholder="Share a tip, ask a question or invite other parents to meet up"
            placeholderTextColor={theme.muted}
            style={[styles.input, styles.textarea]}
            accessibilityLabel="Post text"
          />
          <Text style={styles.counter}>
            {text.length}/{POST_MAX_LENGTH}
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton label="Share post" onPress={submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingBottom: 32, gap: 20 },
    section: { gap: 10 },
    label: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    input: {
      fontFamily: FONT.regular,
      fontSize: 15,
      color: t.ink,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    textarea: { minHeight: 140, textAlignVertical: 'top' },
    counter: { alignSelf: 'flex-end', fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    error: { fontFamily: FONT.semibold, fontSize: 13, color: '#C53030' },
  });
}
