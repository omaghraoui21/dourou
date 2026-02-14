import { Stack } from 'expo-router';
import { AuthProvider } from '@fastshot/auth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';
import { TontineProvider } from '@/contexts/TontineContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ConnectivityProvider } from '@/contexts/ConnectivityContext';
import { GovernanceProvider } from '@/contexts/GovernanceContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { supabase } from '@/lib/supabase';
import { initI18n } from '@/i18n/config';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Parallel initialization for faster startup
        const startTime = Date.now();

        // Wait for i18n to be fully initialized
        await initI18n();

        // Ensure minimum delay for smooth UX (avoid flash)
        const elapsed = Date.now() - startTime;
        const minDelay = 500; // Minimum 500ms for brand visibility

        if (elapsed < minDelay) {
          await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
        }

        setIsI18nReady(true);

        // Hide splash screen smoothly
        requestAnimationFrame(() => {
          SplashScreen.hideAsync();
        });
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        // Even if i18n fails, we should still render the app
        setIsI18nReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Don't render the app until i18n is ready
  if (!isI18nReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ConnectivityProvider>
        <ThemeProvider>
          <AuthProvider
            supabaseClient={supabase}
            routes={{
              login: '/auth/phone',
              afterLogin: '/(tabs)',
            }}
          >
            <GovernanceProvider>
              <UserProvider>
                <ToastProvider>
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
                </ToastProvider>
              </UserProvider>
            </GovernanceProvider>
          </AuthProvider>
        </ThemeProvider>
      </ConnectivityProvider>
    </ErrorBoundary>
  );
}
