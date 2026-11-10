import { useEffect } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProvider } from '@/lib/AppContext';
import { ToastProvider } from '@/components/Toast';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-SemiBold': Nunito_600SemiBold,
    'Nunito-Bold': Nunito_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppProvider>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="dark" />
      </ToastProvider>
    </AppProvider>
  );
}
