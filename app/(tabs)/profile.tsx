import { router } from 'expo-router';
import { Bell, CalendarCheck, ChevronRight, Crown, Heart, LogOut, Package, PiggyBank, Pencil, Plus, ShieldCheck } from 'lucide-react-native';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { formatOrderDate, formatINR } from '@/lib/format';
import { FONT, type Palette } from '@/lib/theme';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ThemePicker } from '@/components/ThemePicker';
import { useToast } from '@/components/Toast';

export default function ProfileTab() {
  const { theme, parent, children, activeChild, orders, wishlist, membership, themeOverride, setActiveChild, setThemeOverride, signOut } =
    useApp();
  const toast = useToast();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const initial = parent?.name.trim().charAt(0).toUpperCase() || 'B';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.userCard}>
          <View style={[styles.avatar, { backgroundColor: theme.strong }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.userCopy}>
            <Text style={styles.userName}>{parent?.name || 'Parent'}</Text>
            <Text style={styles.userMeta}>{[parent?.city, parent?.phone && `+91 ${parent.phone}`].filter(Boolean).join('  |  ')}</Text>
          </View>
        </View>

        <Section title="My children">
          <View style={styles.childRow}>
            {children.map((child) => {
              const active = child.id === activeChild?.id;
              return (
                <Pressable
                  key={child.id}
                  onPress={() => {
                    setActiveChild(child.id);
                    toast(`${child.name} is now selected`);
                  }}
                  style={[styles.childChip, active && { backgroundColor: theme.secondary, borderColor: theme.strong }]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.childName, active && { color: theme.strong }]}>{child.name}</Text>
                  <Text style={styles.childMeta}>{child.ageGroup}</Text>
                </Pressable>
              );
            })}
            <Pressable onPress={() => router.navigate('/child/new')} style={styles.addChip} accessibilityRole="button">
              <Plus size={16} color={theme.strong} />
              <Text style={[styles.addText, { color: theme.strong }]}>Add child</Text>
            </Pressable>
          </View>
          {activeChild ? (
            <LinkRow
              icon={Pencil}
              label={`Edit ${activeChild.name}'s profile`}
              meta="Name, gender, age group or remove"
              onPress={() => router.navigate(`/child/${activeChild.id}`)}
            />
          ) : null}
        </Section>

        <Section title="Theme">
          <Text style={styles.hint}>Colours follow your child by default. You can always pick a different look here.</Text>
          <ThemePicker
            value={themeOverride}
            onChange={(next) => {
              setThemeOverride(next);
              toast('Theme updated');
            }}
          />
        </Section>

        <Section title="Activity">
          <LinkRow icon={Package} label="My orders" meta={`${orders.length} order${orders.length === 1 ? '' : 's'}`} onPress={() => router.navigate('/orders')} />
          <LinkRow icon={Heart} label="Wishlist" meta={`${wishlist.length} saved`} onPress={() => router.navigate('/wishlist')} />
          <LinkRow icon={CalendarCheck} label="Appointments and tests" meta="Doctor visits and lab bookings" onPress={() => router.navigate('/bookings')} />
          <LinkRow icon={Crown} label="Baby Bliss Club" meta={membership ? 'Member benefits active' : 'Free delivery and member savings'} onPress={() => router.navigate('/membership')} />
          <LinkRow icon={ShieldCheck} label="Child insurance" meta="Health, accident and savings cover" onPress={() => router.navigate('/insurance')} />
          <LinkRow icon={PiggyBank} label="Child savings goals" meta="School, college and family goals" onPress={() => router.navigate('/savings')} />
          <LinkRow icon={Bell} label="Notifications" meta="Latest updates" onPress={() => router.navigate('/notifications')} />
        </Section>

        {confirmLogout ? (
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Log out of Baby Bliss?</Text>
            <Text style={styles.hint}>Your cart will be cleared on this device.</Text>
            <View style={styles.confirmActions}>
              <View style={styles.confirmButton}>
                <PrimaryButton label="Cancel" variant="outline" onPress={() => setConfirmLogout(false)} />
              </View>
              <View style={styles.confirmButton}>
                <PrimaryButton
                  label="Log out"
                  onPress={() => {
                    signOut();
                    router.replace('/login');
                  }}
                />
              </View>
            </View>
          </View>
        ) : (
          <Pressable onPress={() => setConfirmLogout(true)} style={styles.logout} accessibilityRole="button">
            <LogOut size={18} color={theme.muted} />
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function LinkRow({
  icon: Icon,
  label,
  meta,
  onPress,
}: {
  icon: typeof Package;
  label: string;
  meta: string;
  onPress: () => void;
}) {
  const { theme } = useApp();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <Pressable onPress={onPress} style={styles.linkRow} accessibilityRole="button">
      <View style={[styles.linkIcon, { backgroundColor: theme.secondary }]}>
        <Icon size={18} color={theme.strong} />
      </View>
      <View style={styles.linkCopy}>
        <Text style={styles.linkLabel}>{label}</Text>
        <Text style={styles.linkMeta}>{meta}</Text>
      </View>
      <ChevronRight size={18} color={theme.muted} />
    </Pressable>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 20 },
    title: { fontFamily: FONT.bold, fontSize: 26, color: t.ink },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontFamily: FONT.bold, fontSize: 22, color: '#FFFFFF' },
    userCopy: { flex: 1, gap: 2 },
    userName: { fontFamily: FONT.bold, fontSize: 18, color: t.ink },
    userMeta: { fontFamily: FONT.regular, fontSize: 13, color: t.muted },
    section: { gap: 10 },
    sectionTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    sectionBody: { gap: 10 },
    hint: { fontFamily: FONT.regular, fontSize: 13, color: t.muted, lineHeight: 18 },
    childRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    childChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
      gap: 2,
    },
    childName: { fontFamily: FONT.bold, fontSize: 14, color: t.ink },
    childMeta: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    addChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: t.strong,
    },
    addText: { fontFamily: FONT.semibold, fontSize: 14 },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 16,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    linkIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    linkCopy: { flex: 1, gap: 2 },
    linkLabel: { fontFamily: FONT.semibold, fontSize: 15, color: t.ink },
    linkMeta: { fontFamily: FONT.regular, fontSize: 12, color: t.muted },
    logout: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
    },
    logoutText: { fontFamily: FONT.semibold, fontSize: 15, color: t.muted },
    confirmCard: {
      padding: 18,
      borderRadius: 18,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      gap: 8,
    },
    confirmTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    confirmActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    confirmButton: { flex: 1 },
  });
}
