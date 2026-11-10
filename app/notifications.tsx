import { router } from 'expo-router';
import { Bell, CalendarClock, Gift, Sparkles, Syringe } from 'lucide-react-native';
import { ComponentType, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { toIsoDate } from '@/lib/schedule';
import { FONT, type Palette } from '@/lib/theme';
import { vaccineReminder } from '@/lib/vaccines';
import { ScreenHeader } from '@/components/ScreenHeader';

type NotificationItem = {
  id: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  title: string;
  body: string;
  time: string;
  target: string;
};

const STATIC_ITEMS: NotificationItem[] = [
  {
    id: 'sale',
    icon: Gift,
    title: 'Diaper week offer is live',
    body: 'Up to 30% off on top diaper brands until Sunday.',
    time: 'Yesterday',
    target: '/shop',
  },
  {
    id: 'learn',
    icon: Sparkles,
    title: 'New activity for this age',
    body: 'Tummy time games are ready in the Learn tab.',
    time: '2 days ago',
    target: '/learn',
  },
  {
    id: 'welcome',
    icon: Bell,
    title: 'Welcome to Baby Bliss',
    body: 'Your profile is set up and your theme is ready.',
    time: 'Last week',
    target: '/(tabs)',
  },
];

export default function NotificationsScreen() {
  const { theme, activeChild, vaccinesGiven } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [read, setRead] = useState<string[]>([]);

  const items = useMemo<NotificationItem[]>(() => {
    const reminder = vaccineReminder(activeChild, vaccinesGiven, toIsoDate(new Date()));
    if (!reminder) return STATIC_ITEMS;
    return [
      {
        id: 'vaccine',
        icon: reminder.actionLabel === 'Add date' ? CalendarClock : Syringe,
        title: reminder.title,
        body: reminder.body,
        time: 'Recently',
        target: '/vaccines',
      },
      ...STATIC_ITEMS,
    ];
  }, [activeChild, vaccinesGiven]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Notifications" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const Icon = item.icon;
          const unread = !read.includes(item.id);
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setRead((r) => (r.includes(item.id) ? r : [...r, item.id]));
                router.navigate(item.target);
              }}
              style={[styles.card, unread && { borderColor: theme.strong }]}
              accessibilityRole="button"
            >
              <View style={[styles.icon, { backgroundColor: theme.secondary }]}>
                <Icon size={20} color={theme.strong} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              {unread ? <View style={[styles.unread, { backgroundColor: theme.strong }]} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 12 },
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    copy: { flex: 1, gap: 4 },
    title: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    body: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, lineHeight: 20 },
    time: { fontFamily: FONT.semibold, fontSize: 12, color: t.muted, marginTop: 2 },
    unread: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  });
}
