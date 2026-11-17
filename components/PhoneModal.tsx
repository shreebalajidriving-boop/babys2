import { Modal, Platform, StyleSheet, View, useWindowDimensions, type ModalProps } from 'react-native';

/** Keep in sync with AppShell phone frame. */
export const PHONE_MAX = 440;

/**
 * RN Modal portals outside AppShell on web, so sheets stretch full viewport.
 * This wrapper re-centers content in the same phone-width column.
 */
export function PhoneModal({
  children,
  ...props
}: ModalProps & { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const framed = Platform.OS === 'web' && width > PHONE_MAX + 48;
  const phoneHeight = Math.min(920, height - 32);

  return (
    <Modal transparent {...props}>
      {framed ? (
        <View style={styles.stage}>
          <View style={[styles.phone, { maxHeight: phoneHeight }]}>{children}</View>
        </View>
      ) : (
        <View style={styles.fill}>{children}</View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(20, 24, 28, 0.35)',
  },
  phone: {
    width: '100%',
    maxWidth: PHONE_MAX,
    flex: 1,
    overflow: 'hidden',
    borderRadius: 28,
  },
});
