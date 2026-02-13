import { Stack } from 'expo-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '@/i18n/config';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash after a delay to show custom splash
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth/phone" />
        <Stack.Screen name="auth/otp" />
        <Stack.Screen name="auth/profile" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="tontine/[id]" />
        <Stack.Screen name="tontine/create" />
      </Stack>
    </ThemeProvider>
  );
}
