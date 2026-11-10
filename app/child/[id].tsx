import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChildForm } from '@/components/ChildForm';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/Toast';
import { useApp } from '@/lib/AppContext';
import { FONT, type Palette } from '@/lib/theme';

export default function EditChildScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, children, updateChild, removeChild } = useApp();
  const toast = useToast();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const child = children.find((c) => c.id === id);

  if (!child) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Edit child" />
        <EmptyState title="Child not found" message="This profile may have been removed." />
      </SafeAreaView>
    );
  }

  const canRemove = children.length > 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Edit child" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ChildForm
          submitLabel="Save changes"
          initial={{ name: child.name, gender: child.gender, ageGroup: child.ageGroup }}
          onSubmit={(input) => {
            updateChild(child.id, input);
            toast(`${input.name}'s profile has been updated`);
            router.back();
          }}
        />

        <View style={styles.danger}>
          <Text style={styles.dangerTitle}>Remove profile</Text>
          {canRemove ? (
            confirmRemove ? (
              <View style={styles.confirm}>
                <Text style={styles.dangerBody}>
                  Remove {child.name}? Their saved vaccine records will no longer be shown. Past orders and bookings stay in your history.
                </Text>
                <PrimaryButton
                  label={`Yes, remove ${child.name}`}
                  onPress={() => {
                    removeChild(child.id);
                    toast(`${child.name}'s profile has been removed`);
                    router.replace('/profile');
                  }}
                />
                <PrimaryButton label="Keep profile" variant="outline" onPress={() => setConfirmRemove(false)} />
              </View>
            ) : (
              <PrimaryButton label="Remove this child" variant="outline" onPress={() => setConfirmRemove(true)} />
            )
          ) : (
            <Text style={styles.dangerBody}>Add another child before removing this one. Your account needs at least one child profile.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32, gap: 32 },
    danger: { gap: 12, paddingTop: 24, borderTopWidth: 1, borderTopColor: t.border },
    dangerTitle: { fontFamily: FONT.bold, fontSize: 16, color: t.ink },
    dangerBody: { fontFamily: FONT.regular, fontSize: 14, color: t.muted, lineHeight: 21 },
    confirm: { gap: 12 },
  });
}
