import { Send, Sparkles, Trash2, TriangleAlert } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { answerFor, ASSISTANT_DISCLAIMER, EMERGENCY_NOTE, GUIDED_TOPICS } from '@/lib/assistant';
import { FONT, type Palette } from '@/lib/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/Toast';

const REPLY_DELAY_MS = 900;

export default function AssistantScreen() {
  const { theme, assistantMessages, addAssistantMessage, clearAssistantChat } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const showToast = useToast();
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const send = (text: string) => {
    const question = text.trim();
    if (!question || thinking) return;
    addAssistantMessage('user', question);
    setDraft('');
    setThinking(true);
    timerRef.current = setTimeout(() => {
      addAssistantMessage('assistant', answerFor(question));
      setThinking(false);
      timerRef.current = null;
    }, REPLY_DELAY_MS);
  };

  const clearChat = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setThinking(false);
    clearAssistantChat();
    showToast('Chat cleared');
  };

  const isEmpty = assistantMessages.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Parenting assistant"
        right={
          isEmpty ? undefined : (
            <Pressable onPress={clearChat} accessibilityRole="button" accessibilityLabel="Clear chat" style={styles.clearButton}>
              <Trash2 size={18} color={theme.strong} />
            </Pressable>
          )
        }
      />
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={styles.notice}>
          <TriangleAlert size={16} color={theme.strong} />
          <Text style={styles.noticeText}>{ASSISTANT_DISCLAIMER}</Text>
        </View>

        {isEmpty ? (
          <View style={styles.intro}>
            <View style={styles.introIcon}>
              <Sparkles size={22} color={theme.strong} />
            </View>
            <Text style={styles.introTitle}>What would you like to know?</Text>
            <Text style={styles.introBody}>Choose a common question or type your own below.</Text>
            <View style={styles.suggestions}>
              {GUIDED_TOPICS.map((topic) => (
                <Pressable
                  key={topic.id}
                  onPress={() => send(topic.question)}
                  style={styles.suggestion}
                  accessibilityRole="button"
                >
                  <Text style={styles.suggestionText}>{topic.question}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.thread}>
            {assistantMessages.map((message) => {
              const mine = message.role === 'user';
              return (
                <View key={message.id} style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                    <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{message.text}</Text>
                  </View>
                </View>
              );
            })}
            {thinking ? (
              <View style={styles.bubbleRow}>
                <View style={[styles.bubble, styles.bubbleOther]}>
                  <Text style={styles.bubbleText}>Thinking...</Text>
                </View>
              </View>
            ) : null}
            <Text style={styles.emergency}>{EMERGENCY_NOTE}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => send(draft)}
          placeholder="Ask a question about your child"
          placeholderTextColor={theme.muted}
          style={styles.input}
          editable={!thinking}
          returnKeyType="send"
          maxLength={300}
          accessibilityLabel="Your question"
        />
        <Pressable
          onPress={() => send(draft)}
          disabled={!draft.trim() || thinking}
          style={[styles.sendButton, (!draft.trim() || thinking) && styles.sendDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Send question"
        >
          <Send size={18} color={theme.card} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    flex: { flex: 1 },
    content: { paddingHorizontal: 20, paddingVertical: 12, gap: 16, flexGrow: 1 },
    clearButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    notice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 14,
      backgroundColor: t.secondary,
    },
    noticeText: { flex: 1, fontFamily: FONT.semibold, fontSize: 12, color: t.ink, lineHeight: 18 },
    intro: { gap: 8, paddingTop: 8 },
    introIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      marginBottom: 4,
    },
    introTitle: { fontFamily: FONT.bold, fontSize: 20, color: t.ink },
    introBody: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, lineHeight: 21 },
    suggestions: { gap: 10, marginTop: 8 },
    suggestion: {
      padding: 14,
      borderRadius: 14,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    suggestionText: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink },
    thread: { gap: 10 },
    bubbleRow: { flexDirection: 'row', justifyContent: 'flex-start' },
    bubbleRowMine: { justifyContent: 'flex-end' },
    bubble: { maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
    bubbleMine: { backgroundColor: t.strong, borderBottomRightRadius: 4 },
    bubbleOther: { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderBottomLeftRadius: 4 },
    bubbleText: { fontFamily: FONT.regular, fontSize: 14, color: t.ink, lineHeight: 21 },
    bubbleTextMine: { color: t.card },
    emergency: { fontFamily: FONT.semibold, fontSize: 12, color: t.muted, lineHeight: 18, marginTop: 8 },
    composer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: t.border,
      backgroundColor: t.background,
    },
    input: {
      flex: 1,
      fontFamily: FONT.regular,
      fontSize: 15,
      color: t.ink,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.strong,
    },
    sendDisabled: { opacity: 0.4 },
  });
}
