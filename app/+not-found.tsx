import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { GoldButton } from '@/components/GoldButton';
import { Spacing, FontSizes } from '@/constants/theme';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.icon}>404</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        {t('common.not_found_title')}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('common.not_found_description')}
      </Text>
      <GoldButton
        title={t('common.go_home')}
        onPress={() => router.replace('/')}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  icon: {
    fontSize: 80,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    width: '100%',
    maxWidth: 300,
  },
});
