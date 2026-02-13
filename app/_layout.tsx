import { Stack } from 'expo-router';
import { AuthProvider } from '@fastshot/auth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';
import { TontineProvider } from '@/contexts/TontineContext';
import { supabase } from '@/lib/supabase';
import '@/i18n/config';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider
        supabaseClient={supabase}
        routes={{
          login: '/auth/phone',
          afterLogin: '/(tabs)',
        }}
      >
        <UserProvider>
          <TontineProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="auth/phone" />
              <Stack.Screen name="auth/otp" />
              <Stack.Screen name="auth/profile" />
              <Stack.Screen name="auth/callback" />
              <Stack.Screen name="auth/admin-login" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="tontine/[id]" />
              <Stack.Screen name="tontine/create" />
              <Stack.Screen name="tontine/join" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </TontineProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
