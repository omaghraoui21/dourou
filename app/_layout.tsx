import { Stack } from 'expo-router';
import { AuthProvider } from '@fastshot/auth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';
import { TontineProvider } from '@/contexts/TontineContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
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
          <NotificationProvider>
            <TontineProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'fade_from_bottom',
                  animationDuration: 300,
                }}
              >
                <Stack.Screen name="index" options={{ animation: 'fade' }} />
                <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
                <Stack.Screen name="auth/phone" options={{ animation: 'fade' }} />
                <Stack.Screen name="auth/otp" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="auth/profile" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="auth/callback" options={{ animation: 'fade' }} />
                <Stack.Screen name="auth/admin-login" options={{ animation: 'fade' }} />
                <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
                <Stack.Screen name="tontine/[id]" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="tontine/create" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="tontine/join" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="+not-found" options={{ animation: 'fade' }} />
              </Stack>
            </TontineProvider>
          </NotificationProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
