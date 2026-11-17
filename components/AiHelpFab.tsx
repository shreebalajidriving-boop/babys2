import { router, usePathname } from 'expo-router';
import { MapPin, MessageCircle, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/lib/AppContext';
import { CITIES } from '@/lib/cities';
import { FONT, type Palette } from '@/lib/theme';
import { PhoneModal } from '@/components/PhoneModal';

const HIDDEN = ['/login', '/onboarding', '/setup', '/assistant'];

export function AiHelpFab() {
  const { theme, parent, updateParentCity } = useApp();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [open, setOpen] = useState(false);
  const [pickingCity, setPickingCity] = useState(false);

  if (HIDDEN.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.fab, { bottom: Math.max(insets.bottom, 10) + 72, backgroundColor: theme.strong }]}
        accessibilityRole="button"
        accessibilityLabel="Open AI help"
      >
        <MessageCircle size={22} color="#FFFFFF" />
      </Pressable>

      <PhoneModal visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>AI parenting help</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12} accessibilityLabel="Close">
                <X size={20} color={theme.muted} />
              </Pressable>
            </View>
            <Text style={styles.sheetBody}>
              Ask about sleep, feeding, vaccines, or shopping tips
              {parent?.city ? ` for families in ${parent.city}` : ''}.
            </Text>

            <Pressable
              onPress={() => setPickingCity(true)}
              style={styles.locationRow}
              accessibilityRole="button"
            >
              <MapPin size={18} color={theme.strong} />
              <View style={styles.locationCopy}>
                <Text style={styles.locationLabel}>Your location</Text>
                <Text style={styles.locationValue}>{parent?.city ?? 'Choose a city'}</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                setOpen(false);
                router.push('/assistant');
              }}
              style={[styles.primary, { backgroundColor: theme.strong }]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryText}>Chat with AI help</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </PhoneModal>

      <PhoneModal visible={pickingCity} animationType="slide" onRequestClose={() => setPickingCity(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPickingCity(false)}>
          <Pressable style={styles.citySheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Change location</Text>
            <Text style={styles.sheetBody}>We’ll tailor care tips and nearby services to your city.</Text>
            <View style={styles.cityList}>
              {CITIES.map((city) => {
                const active = parent?.city === city;
                return (
                  <Pressable
                    key={city}
                    onPress={() => {
                      updateParentCity(city);
                      setPickingCity(false);
                    }}
                    style={[styles.cityChip, active && { backgroundColor: theme.strong, borderColor: theme.strong }]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.cityText, active && { color: '#FFFFFF' }]}>{city}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </PhoneModal>
    </>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    fab: {
      position: 'absolute',
      right: 18,
      zIndex: 40,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(20, 24, 28, 0.45)',
      justifyContent: 'flex-end',
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.border,
      marginBottom: 4,
    },
    sheet: {
      backgroundColor: t.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 24,
      gap: 16,
      borderTopWidth: 1,
      borderColor: t.border,
      width: '100%',
    },
    citySheet: {
      backgroundColor: t.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 24,
      gap: 14,
      maxHeight: '70%',
      width: '100%',
    },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sheetTitle: { fontFamily: FONT.bold, fontSize: 20, color: t.ink },
    sheetBody: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, lineHeight: 20 },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 16,
      backgroundColor: t.secondary,
      width: '100%',
    },
    locationCopy: { flex: 1, gap: 2 },
    locationLabel: { fontFamily: FONT.semibold, fontSize: 12, color: t.muted },
    locationValue: { fontFamily: FONT.bold, fontSize: 15, color: t.ink },
    primary: {
      minHeight: 52,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    primaryText: { fontFamily: FONT.bold, fontSize: 15, color: '#FFFFFF' },
    cityList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    cityChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.background,
    },
    cityText: { fontFamily: FONT.semibold, fontSize: 14, color: t.ink },
  });
}
