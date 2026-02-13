import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GoldButton } from '@/components/GoldButton';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function PhoneAuthScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const rtl = i18n.language === 'ar';
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (phone.length < 8) return;

    setLoading(true);
    setError('');
    const fullPhone = `+216${phone.replace(/\s/g, '')}`;

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (otpError) {
        console.error('OTP send error:', otpError);
        setError(otpError.message);
        Alert.alert(t('common.error'), otpError.message);
      } else {
        router.push({
          pathname: '/auth/otp',
          params: { phone: fullPhone },
        });
      }
    } catch (err) {
      console.error('Phone auth error:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
          {t('auth.phone_title')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
          {t('auth.phone_subtitle')}
        </Text>

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderColor: error ? colors.error : colors.border },
            rtl && { flexDirection: 'row-reverse' },
          ]}
        >
          <Text style={[styles.prefix, { color: colors.text }]}>+216</Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="20 123 456"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setError('');
            }}
            maxLength={11}
          />
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : null}

        <GoldButton
          title={t('common.continue')}
          onPress={handleContinue}
          loading={loading}
          disabled={phone.replace(/\s/g, '').length < 8}
          style={styles.button}
        />
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
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    height: 56,
  },
  prefix: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.lg,
  },
  errorText: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
  },
  button: {
    width: '100%',
    marginTop: Spacing.sm,
  },
});
