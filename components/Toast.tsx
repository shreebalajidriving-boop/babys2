import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FONT } from '@/lib/theme';

const ToastContext = createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((next: string) => {
    setMessage(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2200);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message ? (
        <View pointerEvents="none" style={styles.wrap}>
          <Text style={styles.text}>{message}</Text>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    maxWidth: 360,
    backgroundColor: '#1E2433',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: FONT.semibold,
    fontSize: 14,
    textAlign: 'center',
  },
});
