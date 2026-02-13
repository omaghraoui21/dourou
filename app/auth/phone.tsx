import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GoldButton } from '@/components/GoldButton';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { isSuperAdmin, getSuperAdminUser } from '@/config/superAdmin';
import { useUser } from '@/contexts/UserContext';

export default function PhoneAuthScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { setUser } = useUser();
  const rtl = i18n.language === 'ar';
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (phone.length >= 8) {
      setLoading(true);
      const fullPhone = `+216${phone}`;

      // Check if this is the Super Admin
      if (isSuperAdmin(fullPhone)) {
        // Bypass OTP and profile setup for Super Admin
        const superAdminUser = getSuperAdminUser();
        await setUser(superAdminUser);
        setTimeout(() => {
          setLoading(false);
          router.replace('/(tabs)');
        }, 1000);
      } else {
        // Normal authentication flow
        setTimeout(() => {
          setLoading(false);
          router.push({
            pathname: '/auth/otp',
            params: { phone: fullPhone },
          });
        }, 1000);
      }
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
            { backgroundColor: colors.card, borderColor: colors.border },
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
            onChangeText={setPhone}
            maxLength={11}
          />
        </View>

        <GoldButton
          title={t('common.continue')}
          onPress={handleContinue}
          loading={loading}
          disabled={phone.length < 8}
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
    marginBottom: Spacing.lg,
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
  button: {
    width: '100%',
  },
});
