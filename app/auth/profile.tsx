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
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GoldButton } from '@/components/GoldButton';
import { Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useUser } from '@/contexts/UserContext';
import { User } from '@/types';

export default function ProfileSetupScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { setUser } = useUser();
  const rtl = i18n.language === 'ar';
  const { phone } = useLocalSearchParams();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (firstName && lastName) {
      setLoading(true);

      // Create user object
      const newUser: User = {
        id: `user_${Date.now()}`,
        firstName,
        lastName,
        phone: phone as string,
        avatar: `${firstName.charAt(0)}${lastName.charAt(0)}`,
        trustScore: 3.0, // Starting trust score
        role: 'member',
        isVerified: true,
        createdAt: new Date(),
      };

      await setUser(newUser);

      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        router.replace('/(tabs)');
      }, 1000);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text, textAlign: rtl ? 'right' : 'left' }]}>
          {t('auth.profile_title')}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: rtl ? 'right' : 'left' }]}>
          {t('auth.profile_subtitle')}
        </Text>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
                textAlign: rtl ? 'right' : 'left',
              },
            ]}
            placeholder={t('auth.first_name')}
            placeholderTextColor={colors.textSecondary}
            value={firstName}
            onChangeText={setFirstName}
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
                textAlign: rtl ? 'right' : 'left',
              },
            ]}
            placeholder={t('auth.last_name')}
            placeholderTextColor={colors.textSecondary}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <GoldButton
          title={t('common.continue')}
          onPress={handleContinue}
          loading={loading}
          disabled={!firstName || !lastName}
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
  form: {
    marginBottom: Spacing.lg,
  },
  input: {
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    fontSize: FontSizes.md,
  },
  button: {
    width: '100%',
  },
});
