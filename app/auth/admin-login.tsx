import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GoldButton } from '@/components/GoldButton';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { SUPER_ADMIN_CONFIG } from '@/config/superAdmin';

export default function AdminLoginScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const rtl = i18n.language === 'ar';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        console.error('Admin login error:', signInError);
        setError(signInError.message);
        Alert.alert('Authentication Failed', signInError.message);
        return;
      }

      if (!data.user) {
        setError('Authentication failed');
        return;
      }

      // Fetch user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, phone')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        setError('Failed to verify admin status');
        await supabase.auth.signOut();
        return;
      }

      // Verify admin role
      if (profile.role !== 'admin' && profile.phone !== SUPER_ADMIN_CONFIG.phone) {
        setError('Unauthorized: Admin access required');
        Alert.alert('Access Denied', 'This account does not have administrative privileges.');
        await supabase.auth.signOut();
        return;
      }

      // Successful admin login
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Admin login error:', err);
      setError('An unexpected error occurred');
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        {/* Admin Badge Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.adminBadge}
          >
            <Text style={styles.adminIcon}>👑</Text>
            <Text style={styles.adminBadgeText}>Admin Access</Text>
          </LinearGradient>
        </View>

        <Text style={[styles.title, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
          Administrative Login
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
          Sign in with your administrator credentials
        </Text>

        {/* Email Input */}
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
            Email Address
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: error ? colors.error : colors.border,
                color: colors.text,
                textAlign: rtl ? 'right' : 'left',
              },
            ]}
            placeholder="admin@example.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />

          {/* Password Input */}
          <Text style={[styles.label, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
            Password
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: error ? colors.error : colors.border,
                color: colors.text,
                textAlign: rtl ? 'right' : 'left',
              },
            ]}
            placeholder="Enter your password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
          />
        </View>

        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>⚠️ {error}</Text>
          </View>
        ) : null}

        <GoldButton
          title="Sign In as Admin"
          onPress={handleAdminLogin}
          loading={loading}
          disabled={!email.trim() || !password.trim()}
          style={styles.button}
        />

        {/* Back to Standard Login */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToLogin}
          disabled={loading}
        >
          <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>
            ← Back to Standard Login
          </Text>
        </TouchableOpacity>

        {/* Security Notice */}
        <View style={[styles.securityNotice, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.securityText, { color: colors.textSecondary }]}>
            🔒 This is a secure administrative interface. All login attempts are logged and monitored.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  adminIcon: {
    fontSize: 20,
  },
  adminBadgeText: {
    color: '#0F172A',
    fontSize: FontSizes.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.xl,
  },
  form: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    marginTop: Spacing.sm,
  },
  backButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    padding: Spacing.sm,
  },
  backButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  securityNotice: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  securityText: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
